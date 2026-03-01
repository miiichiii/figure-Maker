#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {
    file: "",
    port: 4173,
    headful: false,
    out: ""
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--file") {
      args.file = String(argv[i + 1] || "");
      i += 1;
      continue;
    }
    if (a === "--port") {
      const p = Number(argv[i + 1] || 0);
      if (Number.isFinite(p) && p > 0) args.port = p;
      i += 1;
      continue;
    }
    if (a === "--out") {
      args.out = String(argv[i + 1] || "");
      i += 1;
      continue;
    }
    if (a === "--headful") {
      args.headful = true;
      continue;
    }
  }
  return args;
}

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

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address());
    });
  });
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function collectState(page, label) {
  return page.evaluate((name) => {
    const canvas = document.getElementById("canvas");
    const stateObj = (typeof state !== "undefined" && state) ? state : (window.state || {});
    const withBBox = (el) => {
      try {
        const b = el.getBBox();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      } catch (_) {
        return null;
      }
    };
    const nodes = canvas
      ? Array.from(canvas.querySelectorAll("[data-id]")).filter((n) => n instanceof SVGElement)
      : [];
    const tagCounts = {};
    let editableCount = 0;
    nodes.forEach((n) => {
      const local = String(n.localName || "").toLowerCase();
      tagCounts[local] = (tagCounts[local] || 0) + 1;
      if (typeof window.isEditableElement === "function" && window.isEditableElement(n)) editableCount += 1;
    });
    const topChildren = canvas
      ? Array.from(canvas.children).slice(0, 30).map((n, i) => ({
          i,
          tag: n.tagName,
          localName: n.localName || null,
          id: n.id || null,
          dataId: n.dataset ? n.dataset.id || null : null,
          className: n.getAttribute ? n.getAttribute("class") || null : null,
          pointer: n instanceof Element ? getComputedStyle(n).pointerEvents : null,
          editable: typeof window.isEditableElement === "function" && n instanceof SVGElement ? window.isEditableElement(n) : null,
          bbox: n instanceof SVGGraphicsElement ? withBBox(n) : null
        }))
      : [];
    let centerHits = [];
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      const cx = Math.round((r.left + r.right) / 2);
      const cy = Math.round((r.top + r.bottom) / 2);
      centerHits = (document.elementsFromPoint(cx, cy) || [])
        .filter((el) => el instanceof SVGElement)
        .slice(0, 12)
        .map((el) => ({
          tag: el.tagName,
          localName: el.localName || null,
          dataId: el.dataset ? el.dataset.id || null : null,
          id: el.id || null,
          editable: typeof window.isEditableElement === "function" ? window.isEditableElement(el) : null
        }));
    }
    const selectedIds = Array.isArray(stateObj.selectedIds) ? stateObj.selectedIds.slice() : [];
    const selected = selectedIds
      .map((id) => {
        try {
          return canvas ? canvas.querySelector(`[data-id="${CSS.escape(String(id))}"]`) : null;
        } catch (_) {
          return null;
        }
      })
      .filter((n) => n instanceof SVGElement)
      .map((n) => ({
        dataId: n.dataset ? n.dataset.id || null : null,
        tag: n.tagName,
        localName: n.localName || null,
        id: n.id || null,
        bbox: withBBox(n)
      }));
    return {
      label: name,
      at: new Date().toISOString(),
      statusMessage: String(stateObj.statusMessage || ""),
      selectedIds,
      selected,
      dataIdCount: nodes.length,
      editableCount,
      tagCounts,
      topChildren,
      centerHits
    };
  }, label);
}

async function clickCandidate(page, kind) {
  const cand = await page.evaluate((targetKind) => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return null;
    const nodes = Array.from(canvas.querySelectorAll("[data-id]")).filter((n) => n instanceof SVGElement);
    const filtered = nodes.filter((n) => {
      const tag = String(n.localName || "").toLowerCase();
      if (targetKind === "text") return tag === "text" && n.getAttribute("data-fm-group-label") !== "1";
      if (targetKind === "image") return tag === "image";
      if (targetKind === "group") return tag === "g";
      return false;
    });
    const scored = filtered
      .map((n) => {
        let b = null;
        try {
          b = n.getBBox();
        } catch (_) {}
        const r = n.getBoundingClientRect();
        return {
          id: n.dataset ? n.dataset.id || "" : "",
          tag: n.tagName,
          localName: n.localName || "",
          area: b ? b.width * b.height : 0,
          rect: { x: r.left, y: r.top, w: r.width, h: r.height }
        };
      })
      .filter((n) => n.id && n.rect.w > 1 && n.rect.h > 1 && Number.isFinite(n.area) && n.area > 0.25)
      .sort((a, b) => a.area - b.area);
    if (!scored.length) return null;
    const pick = scored[0];
    return {
      id: pick.id,
      tag: pick.tag,
      localName: pick.localName,
      x: pick.rect.x + Math.max(2, Math.min(pick.rect.w - 2, pick.rect.w / 2)),
      y: pick.rect.y + Math.max(2, Math.min(pick.rect.h - 2, pick.rect.h / 2))
    };
  }, kind);
  if (!cand) return { kind, clicked: false, reason: "no-candidate", selectedIds: [] };
  await page.mouse.click(cand.x, cand.y);
  await page.waitForTimeout(80);
  const selectedIds = await page.evaluate(() => {
    const s = (typeof state !== "undefined" && state) ? state : window.state;
    return Array.isArray(s?.selectedIds) ? s.selectedIds.slice() : [];
  });
  return { kind, clicked: true, candidate: cand, selectedIds };
}

async function waitForImportResult(page, timeoutMs = 120000) {
  await page.waitForFunction(() => {
    const s = (typeof state !== "undefined" && state) ? state : window.state;
    const msg = String(s?.statusMessage || "");
    return /(Imported AI file|Imported AI as raster image|AI import failed|could not be read|Import failed)/i.test(msg);
  }, { timeout: timeoutMs });
  return page.evaluate(() => {
    const s = (typeof state !== "undefined" && state) ? state : window.state;
    return String(s?.statusMessage || "");
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error("Usage: node scripts/verify-ai-import.cjs --file \"/absolute/path/to/file.ai\" [--headful] [--out path]");
    process.exit(1);
  }
  const aiFile = path.resolve(args.file);
  if (!fs.existsSync(aiFile)) {
    console.error(`AI file not found: ${aiFile}`);
    process.exit(1);
  }

  const server = createStaticServer(ROOT);
  let addr = null;
  try {
    try {
      addr = await listen(server, args.port);
    } catch (err) {
      if (String(err && err.code || "") === "EADDRINUSE") {
        addr = await listen(server, 0);
      } else {
        throw err;
      }
    }

    const url = `http://127.0.0.1:${addr.port}/index.html?debug=1`;
    const browser = await chromium.launch({ headless: !args.headful });
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const page = await context.newPage();
    const consoleMessages = [];
    page.on("console", (msg) => {
      const t = msg.type();
      if (t === "warning" || t === "error") {
        const text = msg.text();
        if (consoleMessages.length < 300) consoleMessages.push({ type: t, text });
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#importFileInput", { state: "attached", timeout: 20000 });
    await page.waitForFunction(() => {
      const s = (typeof state !== "undefined" && state) ? state : window.state;
      return typeof window.importAiFile === "function" && !!s;
    }, { timeout: 30000 });

    const before = await collectState(page, "before-import");
    await page.setInputFiles("#importFileInput", aiFile);
    const importStatus = await waitForImportResult(page);
    await page.waitForTimeout(150);
    const afterImport = await collectState(page, "after-import");

    await page.evaluate(() => {
      if (typeof window.ungroupSelected === "function") window.ungroupSelected();
    });
    await page.waitForTimeout(150);
    const afterUngroup = await collectState(page, "after-ungroup");

    const clicks = [];
    clicks.push(await clickCandidate(page, "text"));
    clicks.push(await clickCandidate(page, "image"));
    const afterClicks = await collectState(page, "after-clicks");

    const report = {
      generatedAt: new Date().toISOString(),
      appUrl: url,
      aiFile,
      importStatus,
      before,
      afterImport,
      afterUngroup,
      clickChecks: clicks,
      afterClicks,
      consoleWarningsOrErrors: consoleMessages
    };

    const reportsDir = path.join(ROOT, "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const outPath = args.out
      ? path.resolve(args.out)
      : path.join(reportsDir, `ai-import-verify-${nowStamp()}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    console.log(`Report written: ${outPath}`);
    console.log(`Import status: ${importStatus}`);
    console.log(`After ungroup selectedIds: ${JSON.stringify(afterUngroup.selectedIds)}`);
    console.log(`After clicks selectedIds: ${JSON.stringify(afterClicks.selectedIds)}`);
    await browser.close();
  } finally {
    await new Promise((resolve) => server.close(() => resolve()));
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
