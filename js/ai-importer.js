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
      
      // ==========================================
      // 【完全ハイブリッド・アーキテクチャへの移行】
      // Canvas背景 ＋ SVGテキスト の2レイヤー構造
      // ==========================================
      const scale = 2.0; // 高解像度担保のために2倍でレンダリング
      const viewport = page.getViewport({ scale });
      
      // 【レイヤー1：背景】 Canvasによる完璧な画像・図形描画
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      
      // page.render は SMask や画像を完璧に処理します
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      // 描画された完璧な結果をロスレスのBase64 PNGへ変換
      const bgBase64 = canvas.toDataURL('image/png');
      
      // 【レイヤー2：コンテナ】 ベースとなるSVG要素の作成
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      // CSS等での表示用に本来のサイズを設定
      svgEl.setAttribute('width', viewport.width / scale);
      svgEl.setAttribute('height', viewport.height / scale);
      // 内部座標は高解像度Canvasに合わせる
      svgEl.setAttribute('viewBox', `0 0 ${viewport.width} ${viewport.height}`);
      
      // 背景画像をSVGの最背面に配置
      const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      bgImage.setAttribute('href', bgBase64);
      bgImage.setAttribute('width', viewport.width);
      bgImage.setAttribute('height', viewport.height);
      svgEl.appendChild(bgImage);
      
      // 【レイヤー3：テキスト】 編集可能なSVGテキストのオーバーレイ
      const textContent = await page.getTextContent();
      const textLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      textLayerGroup.setAttribute('id', 'figure-text-layer');
      
      textContent.items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        
        // viewport.transform を渡すことで、Canvas画像とテキストの位置が完璧に一致します
        const tx = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
        const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) || Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
        const angle = Math.atan2(tx[1], tx[0]) * (180 / Math.PI);
        const scaleX = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
        const scaleRatio = scaleX / fontSize;
        
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.textContent = item.str;
        textEl.setAttribute('xml:space', 'preserve');
        textEl.setAttribute('x', tx[4]);
        textEl.setAttribute('y', tx[5]);
        textEl.setAttribute('font-size', `${fontSize}px`);
        textEl.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
        textEl.setAttribute('fill', '#000000'); 
        textEl.setAttribute('dominant-baseline', 'alphabetic');
        
        if (Math.abs(angle) > 0.1 || Math.abs(scaleRatio - 1.0) > 0.05) {
          textEl.setAttribute('transform', `translate(${tx[4]}, ${tx[5]}) rotate(${angle}) scale(${scaleRatio}, 1) translate(${-tx[4]}, ${-tx[5]})`);
        }
        textLayerGroup.appendChild(textEl);
      });
      
      svgEl.appendChild(textLayerGroup);
      
      let svgString = new XMLSerializer().serializeToString(svgEl);
      // Force all font-families to sans-serif to rescue standard English text from mojibake
      svgString = svgString.replace(/font-family="[^"]*"/g, 'font-family="sans-serif, Arial"');
      return svgString;
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
