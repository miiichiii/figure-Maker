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

async function aiFileToSvgText(file) {
      const pdfjsLib = await ensurePdfJsLib();
      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      if (!pdf || pdf.numPages < 1) throw new Error("No pages found in AI/PDF document.");
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const opList = await page.getOperatorList();
      if (typeof pdfjsLib.SVGGraphics !== "function") {
        throw new Error("pdf.js SVG renderer is unavailable.");
      }
      const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
      
      // Patch instance to prevent subarray/image-decode errors from crashing the whole SVG conversion
      const origInline = svgGfx.paintInlineImageXObject;
      if (typeof origInline === "function") {
        svgGfx.paintInlineImageXObject = function(...args) {
          try { return origInline.apply(this, args); } catch (e) { console.warn("Ignored inline image error:", e); }
        };
      }
      const origImage = svgGfx.paintImageXObject;
      if (typeof origImage === "function") {
        svgGfx.paintImageXObject = function(...args) {
          try { return origImage.apply(this, args); } catch (e) { console.warn("Ignored image error:", e); }
        };
      }

      const svgEl = await svgGfx.getSVG(opList, viewport);
      if (!(svgEl instanceof SVGElement)) throw new Error("Failed to convert AI page to SVG.");
      if (!svgEl.getAttribute("xmlns")) svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return new XMLSerializer().serializeToString(svgEl);
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
        
        // --- Plan A: Warn user if un-outlined text is detected ---
        if (svgText.includes("<text") || svgText.includes("<tspan") || svgText.includes("font-family")) {
          alert("⚠️ AIファイル内にアウトライン化されていないテキストが含まれています。\n正しく表示されない（文字化けする）可能性があるため、Illustrator等で「テキストのアウトラインを作成」してから保存し直すことをお勧めします。");
        }

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
          
          alert("⚠️ ベクター形式としての読み込みに失敗したため、画像（ラスタ）として読み込みました。\nクリッピングマスクや複雑な画像が含まれている場合、PDF.jsの制限により変換に失敗することがあります。\nベクターとして読み込む場合は、Illustratorで画像を「埋め込み」または「ラスタライズ」して保存し直してください。");
          
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
