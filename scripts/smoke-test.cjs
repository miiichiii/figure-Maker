#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    let reqPath = "/";
    try {
      const parsed = new URL(req.url || "/", "http://127.0.0.1/");
      reqPath = decodeURIComponent(parsed.pathname || "/");
    } catch (_) {
      reqPath = "/";
    }
    const rel = reqPath === "/" ? "/index.html" : reqPath;
    const abs = path.resolve(rootDir, `.${rel}`);
    if (!abs.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    let target = abs;
    try {
      const st = fs.statSync(target);
      if (st.isDirectory()) target = path.join(target, "index.html");
    } catch (_) {}
    fs.readFile(target, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": mimeFor(target), "Cache-Control": "no-cache" });
      res.end(data);
    });
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address());
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function click(page, selector) {
  const loc = page.locator(selector);
  await loc.waitFor({ state: "visible", timeout: 10000 });
  await loc.click();
}

async function statusText(page) {
  return page.locator("#statusMessage").innerText({ timeout: 5000 });
}

async function main() {
  const server = createStaticServer(ROOT);
  let browser;
  try {
    const address = await listen(server);
    const baseUrl = `http://127.0.0.1:${address.port}/`;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const requestFailures = [];

    page.on("pageerror", (err) => pageErrors.push(err.stack || err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("requestfailed", (req) => {
      if (req.resourceType() === "script") {
        requestFailures.push(`${req.url()} :: ${req.failure()?.errorText || "failed"}`);
      }
    });

    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForTimeout(500);

    const deps = await page.evaluate(() => ({
      jsPDF: !!window.jspdf?.jsPDF,
      svg2pdf: !!window.svg2pdf,
      canvg: !!window.canvg?.Canvg?.fromString,
      UTIF: !!window.UTIF,
      importAiFile: typeof window.importAiFile === "function"
    }));
    assert(deps.jsPDF, "jsPDF did not load.");
    assert(deps.svg2pdf, "svg2pdf did not load.");
    assert(deps.canvg, "canvg fallback did not load.");
    assert(deps.UTIF, "UTIF did not load.");
    assert(deps.importAiFile, "AI/PDF import bridge did not initialize.");

    await click(page, '[data-toolbar-tab-btn="object"]');
    await click(page, "#addRect");
    await click(page, "#addLine");
    await click(page, "#matchArrowBtn");

    let shapeState = await page.evaluate(() => ({
      rects: document.querySelectorAll("#canvas rect[data-id]").length,
      arrows: document.querySelectorAll('#canvas line[data-id][marker-end]').length
    }));
    assert(shapeState.rects >= 1, "Rect was not added.");
    assert(shapeState.arrows >= 1, "Arrow marker was not applied.");

    await click(page, '[data-toolbar-tab-btn="text"]');
    await click(page, "#addText");
    const textTarget = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll("#canvas text[data-id]"));
      const el = texts.find((node) => node.getAttribute("data-fm-figure-title") !== "1" && node.textContent === "Text");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    assert(textTarget, "Editable text was not added.");
    await page.mouse.dblclick(textTarget.x, textTarget.y);
    await page.locator("#textEditorInput").fill("ATP synthase");
    await page.locator("#textEditorInput").press("Enter");
    await page.waitForTimeout(150);
    const editedText = await page.evaluate(() => Array.from(document.querySelectorAll("#canvas text[data-id]")).some((el) => el.textContent === "ATP synthase"));
    assert(editedText, "Text edit did not persist.");

    const svgSample = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">',
      '<rect x="10" y="10" width="80" height="60" fill="#dbeafe" stroke="#1e3a8a"/>',
      '<text x="30" y="100" font-size="18">hello</text>',
      "</svg>"
    ].join("");
    await page.setInputFiles("#importFileInput", {
      name: "sample.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(svgSample)
    });
    await page.waitForFunction(() => /SVG imported|Imported/i.test(document.getElementById("statusMessage")?.textContent || ""), null, { timeout: 10000 });
    assert(/imported/i.test(await statusText(page)), "SVG import status was not reported.");

    await click(page, '[data-toolbar-tab-btn="tool"]');
    await page.evaluate(() => {
      window.jspdf.jsPDF.API.svg = async () => {
        throw new Error("forced svg2pdf smoke failure");
      };
    });
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.locator("#exportPdf").click()
    ]);
    assert(/\.pdf$/i.test(download.suggestedFilename()), "PDF export did not produce a PDF download.");
    assert(/PDF exported/i.test(await statusText(page)), "PDF fallback export did not complete.");

    assert(pageErrors.length === 0, `Page errors:\n${pageErrors.join("\n")}`);
    assert(consoleErrors.length === 0, `Console errors:\n${consoleErrors.join("\n")}`);
    assert(requestFailures.length === 0, `Script request failures:\n${requestFailures.join("\n")}`);

    console.log("Smoke test passed.");
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
