import fs from "fs";
import JavaScriptObfuscator from "javascript-obfuscator";

const inputPath = "./main.js";
const outputPath = "./dist/main.js";

// Read raw JS
const inputCode = fs.readFileSync(inputPath, "utf-8");

// Obfuscate it
const obfuscated = JavaScriptObfuscator.obfuscate(inputCode, {
  compact: true,
  controlFlowFlattening: true,
});

// Ensure output folder exists
fs.mkdirSync("./dist", { recursive: true });

// Write obfuscated code to dist
fs.writeFileSync(outputPath, obfuscated.getObfuscatedCode(), "utf-8");

// Copy index.html (assumes it's in root)
fs.copyFileSync("./index.html", "./dist/index.html");
