const fs = require('fs');

const htmlPath = 'index.html';
const jsDir = 'js';
const jsPath = 'js/ai-importer.js';

let html = fs.readFileSync(htmlPath, 'utf8');

// The functions we want to extract
const funcsToExtract = [
  "function isAiFile\\([\\s\\S]*?\\n    \\}",
  "let pdfJsLoadPromise = null;\\n    async function ensurePdfJsLib\\([\\s\\S]*?\\n    \\}",
  "async function aiFileToSvgText\\([\\s\\S]*?\\n    \\}",
  "async function aiFileToRasterImage\\([\\s\\S]*?\\n    \\}",
  "function importDataUrlAsImageFitted\\([\\s\\S]*?\\n    \\}",
  "async function importAiFile\\([\\s\\S]*?\\n    \\}"
];

let extractedCode = "";
let newHtml = html;

for (const pattern of funcsToExtract) {
  const regex = new RegExp("    " + pattern + "\\n?", "m");
  const match = newHtml.match(regex);
  if (match) {
    extractedCode += match[0].trim().replace(/^/gm, '') + "\n\n";
    newHtml = newHtml.replace(match[0], "");
  } else {
    console.log("Could not find match for:", pattern.substring(0, 30));
  }
}

if (!fs.existsSync(jsDir)){
    fs.mkdirSync(jsDir);
}

// Add the script tag where pdfJsLoadPromise used to be, or right before handlePickedImportFile
const scriptTag = '    <script src="js/ai-importer.js"></script>\n';
// Since handlePickedImportFile relies on isAiFile and importAiFile, we need to inject the script at the top or keep it in the DOM.
// Actually, since these are just functions, injecting the <script> tag in the HTML <head> or before the main logic is better.
// Let's inject <script src="js/ai-importer.js"></script> in the head.
if (!newHtml.includes('<script src="js/ai-importer.js"></script>')) {
    newHtml = newHtml.replace('</head>', '  <script src="js/ai-importer.js"></script>\n</head>');
}

// Make the functions global so they can be accessed from the main script
let jsFileContent = `// AI Importer Module
// Extracted from main index.html to improve maintainability

${extractedCode}

// Expose to global scope for the main script
window.isAiFile = isAiFile;
window.ensurePdfJsLib = ensurePdfJsLib;
window.aiFileToSvgText = aiFileToSvgText;
window.aiFileToRasterImage = aiFileToRasterImage;
window.importDataUrlAsImageFitted = importDataUrlAsImageFitted;
window.importAiFile = importAiFile;
`;

fs.writeFileSync(jsPath, jsFileContent, 'utf8');
fs.writeFileSync(htmlPath, newHtml, 'utf8');

console.log("Extraction complete.");
