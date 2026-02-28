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
      // 【部分ハイブリッド・アーキテクチャへの回帰】
      // ベクター図形 ＋ 個別画像エクストラクター ＋ SVGテキスト
      // ==========================================
      const scale = 1.0;
      const viewport = page.getViewport({ scale });
      
      if (typeof pdfjsLib.SVGGraphics !== "function") {
        throw new Error("pdf.js SVG renderer is unavailable.");
      }
      
      const opList = await page.getOperatorList();
      const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);

      // SVGGraphics 側の画像デコーダ（SMask/inline image）でクラッシュしないよう、
      // 画像描画だけを無効化してベクター/テキスト描画を継続させる。
      // 画像はこの後の appendIndividualImagesToSVG で個別抽出して追加する。
      svgGfx.paintInlineImageXObject = function () {};
      svgGfx.paintImageXObject = function () {};
      
      // 1. ベースとなるSVG（パスや図形のみ）を生成
      const svgEl = await svgGfx.getSVG(opList, viewport);
      if (!(svgEl instanceof SVGElement)) throw new Error("Failed to convert AI page to SVG.");
      
      // 2. 独立型・個別画像エクストラクター（SMask等で飛ばされた画像も無理やり引っこ抜く）
      const appendIndividualImagesToSVG = async function(pdfPage, targetSvg, viewport) {
        const ops = await pdfPage.getOperatorList();
        const transformStack = [];
        let currentTransform = [1, 0, 0, 1, 0, 0];
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const imageLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        imageLayer.setAttribute('id', 'extracted-individual-images');
        
        for (let i = 0; i < ops.fnArray.length; i++) {
          const fn = ops.fnArray[i];
          const args = ops.argsArray[i];
          
          // --- 座標（Transform）のトラッキング ---
          if (fn === pdfjsLib.OPS.save) {
            transformStack.push([...currentTransform]);
          } else if (fn === pdfjsLib.OPS.restore) {
            if (transformStack.length > 0) {
              currentTransform = transformStack.pop();
            }
          } else if (fn === pdfjsLib.OPS.transform) {
            currentTransform = pdfjsLib.Util.transform(currentTransform, args);
          } 
          // --- 画像描画コマンドの検知 ---
          else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject) {
            try {
              let imgData;
              if (fn === pdfjsLib.OPS.paintImageXObject) {
                // IDから画像実体を取得
                imgData = pdfPage.objs.get(args[0]);
              } else {
                // インライン画像はそのままデータ
                imgData = args[0];
              }
              
              if (!imgData || !imgData.width || !imgData.height) continue;
              
              // 1. Canvasのサイズを画像に合わせる
              canvas.width = imgData.width;
              canvas.height = imgData.height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // 2. 画像データのデコード (RGB -> RGBAの補正含む)
              if (imgData.bitmap) {
                ctx.drawImage(imgData.bitmap, 0, 0);
              } else if (imgData.data) {
                let rgbaData;
                const expectedLen = imgData.width * imgData.height * 4;
                if (imgData.data.length === imgData.width * imgData.height * 3) {
                  // RGB(3チャンネル) を RGBA(4チャンネル) に変換
                  rgbaData = new Uint8ClampedArray(expectedLen);
                  for (let k = 0, j = 0; k < imgData.data.length; k += 3, j += 4) {
                    rgbaData[j] = imgData.data[k];
                    rgbaData[j+1] = imgData.data[k+1];
                    rgbaData[j+2] = imgData.data[k+2];
                    rgbaData[j+3] = 255; // Alpha
                  }
                } else if (imgData.data.length === expectedLen) {
                  rgbaData = new Uint8ClampedArray(imgData.data);
                } else {
                  continue; // Cannot handle other formats directly here
                }
                const idata = new ImageData(rgbaData, imgData.width, imgData.height);
                ctx.putImageData(idata, 0, 0);
              } else {
                continue;
              }
              
              // 3. 高解像度を維持したままBase64 PNG化
              const base64 = canvas.toDataURL('image/png');
              
              // 4. SVG用の <image> タグを生成
              const svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
              svgImg.setAttribute('href', base64);
              // PDFの仕様上、配置領域は 1x1 にしてTransformで引き伸ばす
              svgImg.setAttribute('width', '1');
              svgImg.setAttribute('height', '1');
              svgImg.setAttribute('preserveAspectRatio', 'none');
              
              // 5. 座標系の合成
              // PDF内部のローカル座標(currentTransform) と 画面全体のスケール(viewport.transform) を掛け合わせる
              const finalMatrix = pdfjsLib.Util.transform(viewport.transform, currentTransform);
              // 画像の上下反転を補正するマトリックス
              const imageLocalMatrix = [1, 0, 0, -1, 0, 1];
              const appliedMatrix = pdfjsLib.Util.transform(finalMatrix, imageLocalMatrix);
              
              // マトリックスを適用して配置
              svgImg.setAttribute('transform', `matrix(${appliedMatrix.join(' ')})`);
              
              imageLayer.appendChild(svgImg);
            } catch (err) {
              console.warn("Failed to extract individual image:", err);
            }
          }
        }
        
        // 抽出した画像群を、ベースのSVGの「一番下（最背面）」に挿入する
        if (targetSvg.firstChild) {
          targetSvg.insertBefore(imageLayer, targetSvg.firstChild);
        } else {
          targetSvg.appendChild(imageLayer);
        }
      };
      
      await appendIndividualImagesToSVG(page, svgEl, viewport);
      
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
