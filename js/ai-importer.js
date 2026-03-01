// AI Importer Module
// Extracted from main index.html to improve maintainability

function isAiFile(file) {
      if (!file) return false;
      const t = String(file.type || "").toLowerCase();
      if (t === "application/postscript" || t === "application/pdf" || t === "application/illustrator") return true;
      return /\.ai$/i.test(String(file.name || ""));
    }

let pdfJsLoadPromise = null;
    async function ensurePdfJsLib() {
      if (window.pdfjsLib) return window.pdfjsLib;
      if (!pdfJsLoadPromise) {
        pdfJsLoadPromise = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
          script.async = true;
          script.onload = () => {
            try {
              if (!window.pdfjsLib) {
                reject(new Error("pdf.js failed to initialize."));
                return;
              }
              const workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
              if (window.pdfjsLib?.GlobalWorkerOptions) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
              }
              resolve(window.pdfjsLib);
            } catch (err) {
              reject(err);
            }
          };
          script.onerror = () => reject(new Error("Failed to load pdf.js."));
          document.head.appendChild(script);
        });
      }
      return pdfJsLoadPromise;
    }

function appendTextLayerToSvg(page, viewport, svgEl, pdfjsLib) {
      return page.getTextContent().then((textContent) => {
        const textLayerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        textLayerGroup.setAttribute("id", "figure-text-layer");
        textLayerGroup.setAttribute("data-fm-ai-root-layer", "1");
        textContent.items.forEach((item) => {
          if (!item.str || item.str.trim() === "") return;
          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
          const fontSize =
            Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) ||
            Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
          const angle = (Math.atan2(tx[1], tx[0]) * 180) / Math.PI;
          const scaleX = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
          const scaleRatio = scaleX / Math.max(0.0001, fontSize);
          const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textEl.textContent = item.str;
          textEl.setAttribute("xml:space", "preserve");
          textEl.setAttribute("x", tx[4]);
          textEl.setAttribute("y", tx[5]);
          textEl.setAttribute("font-size", `${fontSize}px`);
          textEl.setAttribute("font-family", "Arial, Helvetica, sans-serif");
          textEl.setAttribute("fill", "#000000");
          textEl.setAttribute("dominant-baseline", "alphabetic");
          if (Math.abs(angle) > 0.1 || Math.abs(scaleRatio - 1.0) > 0.05) {
            textEl.setAttribute(
              "transform",
              `translate(${tx[4]}, ${tx[5]}) rotate(${angle}) scale(${scaleRatio}, 1) translate(${-tx[4]}, ${-tx[5]})`
            );
          }
          textLayerGroup.appendChild(textEl);
        });
        svgEl.appendChild(textLayerGroup);
      });
    }

async function appendIndividualImagesToSvg(page, svgEl, viewport, pdfjsLib) {
      const ops = await page.getOperatorList();
      const transformStack = [];
      let currentTransform = [1, 0, 0, 1, 0, 0];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imageLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      imageLayer.setAttribute("id", "extracted-individual-images");
      imageLayer.setAttribute("data-fm-ai-root-layer", "1");
      for (let i = 0; i < ops.fnArray.length; i += 1) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i];
        if (fn === pdfjsLib.OPS.save) {
          transformStack.push([...currentTransform]);
          continue;
        }
        if (fn === pdfjsLib.OPS.restore) {
          if (transformStack.length > 0) currentTransform = transformStack.pop();
          continue;
        }
        if (fn === pdfjsLib.OPS.transform) {
          currentTransform = pdfjsLib.Util.transform(currentTransform, args);
          continue;
        }
        if (fn !== pdfjsLib.OPS.paintImageXObject && fn !== pdfjsLib.OPS.paintInlineImageXObject) continue;
        try {
          let imgData = null;
          if (fn === pdfjsLib.OPS.paintImageXObject) imgData = page.objs.get(args[0]);
          else imgData = args[0];
          if (!imgData || !imgData.width || !imgData.height) continue;
          canvas.width = imgData.width;
          canvas.height = imgData.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (imgData.bitmap) {
            ctx.drawImage(imgData.bitmap, 0, 0);
          } else if (imgData.data) {
            const expectedLen = imgData.width * imgData.height * 4;
            let rgba = null;
            if (imgData.data.length === imgData.width * imgData.height * 3) {
              rgba = new Uint8ClampedArray(expectedLen);
              for (let k = 0, j = 0; k < imgData.data.length; k += 3, j += 4) {
                rgba[j] = imgData.data[k];
                rgba[j + 1] = imgData.data[k + 1];
                rgba[j + 2] = imgData.data[k + 2];
                rgba[j + 3] = 255;
              }
            } else if (imgData.data.length === expectedLen) {
              rgba = new Uint8ClampedArray(imgData.data);
            }
            if (!rgba) continue;
            ctx.putImageData(new ImageData(rgba, imgData.width, imgData.height), 0, 0);
          } else {
            continue;
          }
          const href = canvas.toDataURL("image/png");
          const svgImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
          svgImg.setAttribute("href", href);
          svgImg.setAttribute("width", "1");
          svgImg.setAttribute("height", "1");
          svgImg.setAttribute("preserveAspectRatio", "none");
          const finalMatrix = pdfjsLib.Util.transform(viewport.transform, currentTransform);
          const imageLocalMatrix = [1, 0, 0, -1, 0, 1];
          const appliedMatrix = pdfjsLib.Util.transform(finalMatrix, imageLocalMatrix);
          svgImg.setAttribute("transform", `matrix(${appliedMatrix.join(" ")})`);
          imageLayer.appendChild(svgImg);
        } catch (_) {
          // Continue extracting other images.
        }
      }
      if (imageLayer.childNodes.length > 0) svgEl.insertBefore(imageLayer, svgEl.firstChild);
    }

function markAiRootGroups(svgEl) {
      if (!(svgEl instanceof SVGElement)) return;
      Array.from(svgEl.children).forEach((child) => {
        if (!(child instanceof SVGElement)) return;
        const tag = String(child.localName || child.tagName || "").toLowerCase().replace(/^svg:/, "");
        if (tag !== "g") return;
        child.setAttribute("data-fm-ai-root-layer", "1");
      });
    }

async function aiFileToSvgTextStructured(file) {
      const pdfjsLib = await ensurePdfJsLib();
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      if (!pdf || pdf.numPages < 1) throw new Error("No pages found in AI/PDF document.");
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      if (typeof pdfjsLib.SVGGraphics !== "function") throw new Error("pdf.js SVG renderer is unavailable.");
      const opList = await page.getOperatorList();
      const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
      // Avoid known crashes in pdf.js image pipeline; images are added separately.
      svgGfx.paintInlineImageXObject = function () {};
      svgGfx.paintImageXObject = function () {};
      const svgEl = await svgGfx.getSVG(opList, viewport);
      if (!(svgEl instanceof SVGElement)) throw new Error("Failed to convert AI page to SVG.");
      svgEl.querySelectorAll("text, tspan").forEach((el) => el.setAttribute("display", "none"));
      await appendIndividualImagesToSvg(page, svgEl, viewport, pdfjsLib);
      await appendTextLayerToSvg(page, viewport, svgEl, pdfjsLib);
      markAiRootGroups(svgEl);
      let svgString = new XMLSerializer().serializeToString(svgEl);
      svgString = svgString.replace(/font-family="[^"]*"/g, 'font-family="sans-serif, Arial"');
      return svgString;
    }

async function aiFileToSvgTextHybrid(file) {
      const pdfjsLib = await ensurePdfJsLib();
      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      if (!pdf || pdf.numPages < 1) throw new Error("No pages found in AI/PDF document.");
      const page = await pdf.getPage(1);
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas rendering context is unavailable.");
      await page.render({ canvasContext: ctx, viewport }).promise;
      const bgBase64 = canvas.toDataURL("image/png");
      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgEl.setAttribute("width", viewport.width / scale);
      svgEl.setAttribute("height", viewport.height / scale);
      svgEl.setAttribute("viewBox", `0 0 ${viewport.width} ${viewport.height}`);
      const bgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      bgImage.setAttribute("href", bgBase64);
      bgImage.setAttribute("width", viewport.width);
      bgImage.setAttribute("height", viewport.height);
      svgEl.appendChild(bgImage);
      await appendTextLayerToSvg(page, viewport, svgEl, pdfjsLib);
      markAiRootGroups(svgEl);
      let svgString = new XMLSerializer().serializeToString(svgEl);
      svgString = svgString.replace(/font-family="[^"]*"/g, 'font-family="sans-serif, Arial"');
      return svgString;
    }

async function aiFileToSvgText(file) {
      try {
        return await aiFileToSvgTextStructured(file);
      } catch (structuredErr) {
        try {
          return await aiFileToSvgTextHybrid(file);
        } catch (hybridErr) {
          const combined = new Error("Both structured and hybrid AI conversion failed.");
          combined.cause = { structuredErr, hybridErr };
          throw combined;
        }
      }
    }

async function aiFileToRasterImage(file, options = {}) {
      const pdfjsLib = await ensurePdfJsLib();
      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      if (!pdf || pdf.numPages < 1) throw new Error("No pages found in AI/PDF document.");
      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1.0 });
      const maxSide = Math.max(512, Number(options.maxSide || 3072));
      let scale = maxSide / Math.max(1, baseViewport.width, baseViewport.height);
      if (!Number.isFinite(scale) || scale <= 0) scale = 1;
      scale = Math.min(3, Math.max(0.25, scale));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas rendering context is unavailable.");
      const renderTask = page.render({ canvasContext: ctx, viewport });
      await renderTask.promise;
      const dataUrl = canvas.toDataURL("image/png");
      return { dataUrl, width: canvas.width, height: canvas.height };
    }

function importDataUrlAsImageFitted(dataUrl, nativeWidth, nativeHeight, options = {}) {
      const safeW = Math.max(1, Number(nativeWidth || 1));
      const safeH = Math.max(1, Number(nativeHeight || 1));
      const dims = getCanvasDimensions();
      const maxW = Math.max(80, dims.width * 0.82);
      const maxH = Math.max(80, dims.height * 0.82);
      let scale = Math.min(1, maxW / safeW, maxH / safeH);
      if (!Number.isFinite(scale) || scale <= 0) scale = 1;
      const width = Math.max(1, Math.round(safeW * scale));
      const height = Math.max(1, Math.round(safeH * scale));
      const nudge = options.usePasteNudge === false ? { x: 0, y: 0 } : getPasteNudgeOffset();
      const id = insertImageElement(dataUrl, width, height, 0, {
        select: options.select !== false,
        offsetX: nudge.x + Number(options.offsetX || 0),
        offsetY: nudge.y + Number(options.offsetY || 0)
      });
      if (options.skipHistory !== true && id) pushHistory(options.historyReason || "import-image");
      return id;
    }

async function importAiFile(file, options = {}) {
      setStatus("Importing AI file...");
      try {
        const svgText = await aiFileToSvgText(file);
        
        const imported = importSvgTextFitted(svgText);
        if (!imported.length) {
          setStatus("AI import failed: generated SVG was empty or invalid.");
          return [];
        }
        if (options.source === "open") state.fileHandle = options.fileHandle || null;
        setStatus(`Imported AI file (${imported.length} object(s)).`);
        return imported;
      } catch (vectorErr) {
        try {
          setStatus("AI vector conversion failed. Trying image fallback...");
          const raster = await aiFileToRasterImage(file);
          
          const fallbackId = importDataUrlAsImageFitted(raster.dataUrl, raster.width, raster.height, {
            select: true,
            usePasteNudge: false,
            historyReason: options.source === "open" ? "open-ai-raster" : "import-image"
          });
          if (fallbackId) {
            if (options.source === "open") state.fileHandle = options.fileHandle || null;
            setStatus("Imported AI as raster image (fallback).");
            return [fallbackId];
          }
        } catch (fallbackErr) {
          captureError("import-ai-fallback", fallbackErr, { userMessage: "AI fallback import failed." });
        }
        setStatus("This .ai file could not be read. Use AI files saved with PDF compatibility.");
        captureError("import-ai-file", vectorErr, { userMessage: "AI import failed." });
        return [];
      }
    }



// Expose to global scope for the main script
window.isAiFile = isAiFile;
window.ensurePdfJsLib = ensurePdfJsLib;
window.aiFileToSvgText = aiFileToSvgText;
window.aiFileToRasterImage = aiFileToRasterImage;
window.importDataUrlAsImageFitted = importDataUrlAsImageFitted;
window.importAiFile = importAiFile;
