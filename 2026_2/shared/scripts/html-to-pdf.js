#!/usr/bin/env node
/**
 * Convert HTML → PDF via Puppeteer with MathJax rendering.
 *
 * Usage: node html-to-pdf.js <input.html> <output.pdf>
 *
 * Renders MathJax equations before PDF export.
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath || !outputPath) {
    console.error("Usage: node html-to-pdf.js <input.html> <output.pdf>");
    process.exit(1);
  }

  const htmlPath = path.resolve(inputPath);
  const pdfPath = path.resolve(outputPath);

  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML file not found: ${htmlPath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, "utf-8");

  console.log("Launching Chromium...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set viewport large enough for A4 at 96 DPI
    await page.setViewport({ width: 1024, height: 1280, deviceScaleFactor: 1 });

    // Load HTML as a data URI
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    await page.goto(dataUrl, { waitUntil: "networkidle0", timeout: 60000 });

    // Wait for MathJax to finish typesetting
    console.log("Waiting for MathJax...");
    await page.waitForFunction(
      () => {
        if (window.MathJax && window.MathJax.startup) {
          try {
            return window.MathJax.startup.promise && window.MathJax.startup.promise.then(
              () => !window.MathJax.typesetPromise, // typeset done
              () => false
            );
          } catch (e) {
            // MathJax 2.x style
            return window.MathJax.Hub && window.MathJax.Hub.Typeset && !window.MathJax.Hub.TypesettingDone;
          }
        }
        // No MathJax found, proceed anyway
        return true;
      },
      { timeout: 30000 }
    ).catch(() => {
      console.warn("  MathJax wait timed out, proceeding anyway.");
    });

    // Additional wait for MathJax CSS updates to propagate
    await new Promise((r) => setTimeout(r, 2000));

    // Export PDF with A4 settings
    console.log("Generating PDF...");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: {
        top: "2.5cm",
        bottom: "2.5cm",
        left: "2cm",
        right: "2cm",
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span class="header-date"></span>',
      footerTemplate: `<div style="font-size: 9px; color: #888; text-align: center; width: 100%;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });

    console.log(`PDF saved: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
