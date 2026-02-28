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
      
      // -- HYBRID IMAGE LAYER SYNTHESIS --
      const imageLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      imageLayerGroup.setAttribute('id', 'figure-image-layer');
      
      // Create a temporary canvas for converting pdf.js imgData to Base64
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
          const imageName = opList.argsArray[i][0];
          try {
            const imgData = await page.objs.get(imageName);
            if (imgData && imgData.data && imgData.width && imgData.height) {
              tempCanvas.width = imgData.width;
              tempCanvas.height = imgData.height;
              
              // Handle different imgData formats
              if (imgData.kind === "Image") {
                  // Some pdf.js versions return ImageData-like objects directly, but they might need clamped array casting
                  const imageData = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
                  tempCtx.putImageData(imageData, 0, 0);
              } else {
                  // Fallback: draw raw pixels if possible, or skip if too complex to decode manually
                  // Often pdfjsLib.SVGGraphics fails precisely here.
                  // For a quick rescue, we'll rely on the try-catch to fail gracefully.
                  const imageData = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
                  tempCtx.putImageData(imageData, 0, 0);
              }
              
              const base64Image = tempCanvas.toDataURL("image/png");
              
              const svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
              svgImage.setAttribute('href', base64Image);
              
              // We need the transform matrix to place it correctly.
              // This requires looking backward in the operator list for transform (OPS.transform)
              // This is complex and fragile in raw pdf.js.
              // For now, we will append it. If transform is lost, it will appear at 0,0.
              // A better approach is to render the page to a canvas, then extract only the raster regions, 
              // or let the raster-fallback catch it.
              
              svgImage.setAttribute('width', imgData.width);
              svgImage.setAttribute('height', imgData.height);
              imageLayerGroup.appendChild(svgImage);
            }
          } catch (e) {
            console.warn("Manual image extraction failed:", e);
          }
        }
      }
      
      if (imageLayerGroup.childNodes.length > 0) {
        // Insert behind vector layers
        svgEl.insertBefore(imageLayerGroup, svgEl.firstChild);
      }

      // -- HYBRID TEXT LAYER SYNTHESIS --
      // 1. Hide the original corrupted text elements generated by SVGGraphics
      const badTexts = svgEl.querySelectorAll('text, tspan');
      badTexts.forEach(el => el.setAttribute('display', 'none'));
      
      // -- FIX: STRIP CLIP-PATHS FROM IMAGES --
      // Illustrator clipping masks often break in pdf.js, making images invisible.
      // We force-remove clip-paths from groups containing images so they at least appear.
      const imageElements = svgEl.querySelectorAll('image');
      imageElements.forEach(img => {
        let parent = img.parentElement;
        while (parent && parent !== svgEl) {
          if (parent.hasAttribute('clip-path')) {
            parent.removeAttribute('clip-path');
          }
          parent = parent.parentElement;
        }
      });
      
      // 2. Extract clean text using getTextContent
      const textContent = await page.getTextContent();
      const textLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      textLayerGroup.setAttribute('id', 'figure-text-layer');
      
      // 3. Create clean text elements and overlay them
      textContent.items.forEach(item => {
        if (!item.str || item.str.trim() === '') return;
        
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
        textEl.setAttribute('fill', '#000000'); // Note: pdf.js doesn't easily expose item color here, defaulting to black
        textEl.setAttribute('dominant-baseline', 'alphabetic');
        
        if (Math.abs(angle) > 0.1 || Math.abs(scaleRatio - 1.0) > 0.05) {
          textEl.setAttribute('transform', `translate(${tx[4]}, ${tx[5]}) rotate(${angle}) scale(${scaleRatio}, 1) translate(${-tx[4]}, ${-tx[5]})`);
        }
        textLayerGroup.appendChild(textEl);
      });
      
      svgEl.appendChild(textLayerGroup);
      
      if (!svgEl.getAttribute("xmlns")) svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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
