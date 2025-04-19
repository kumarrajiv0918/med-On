const fs = require('fs');
const path = require('path');
const qr = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const officeToPdf = require('office-to-pdf');

// Convert Office files to PDF
async function convertToPdf(inputPath, outputPath) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdfBuffer = await officeToPdf(fileBuffer);
  fs.writeFileSync(outputPath, pdfBuffer);
}

// Convert image files to PDF
async function imageToPdf(inputPath, outputPath) {
  const imageBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.create();
  const image = path.extname(inputPath).toLowerCase() === '.png'
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

// Generate QR Code (Data URL)
async function generateQRCode(url) {
  return new Promise((resolve, reject) => {
    qr.toDataURL(url, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
}

// Embed QR Code in PDF and save to specified output
async function embedQRCodeInPdf(inputPdfPath, qrCodeDataUrl, outputPdfPath) {
  const pdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();
  const qrSize = 50;

  lastPage.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: 30,
    width: qrSize,
    height: qrSize,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
}

module.exports = {
  convertToPdf,
  imageToPdf,
  generateQRCode,
  embedQRCodeInPdf,
};
