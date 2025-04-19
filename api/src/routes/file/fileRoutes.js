const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../../controllers/file/fileController');
const authentication = require('../../middlewares/authentication');
const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
router.use('/uploads', express.static('uploads'));

// Upload route
router.post('/upload', authentication, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const originalPath = `uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const baseName = path.basename(req.file.filename, ext);
    const convertedPdfPath = `uploads/${baseName}_converted.pdf`;

    let finalPdfPath = originalPath;

    if (ext !== '.pdf') {
      if (['.doc', '.docx', '.xls', '.ppt', '.pptx'].includes(ext)) {
        await fileController.convertToPdf(originalPath, convertedPdfPath);
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        await fileController.imageToPdf(originalPath, convertedPdfPath);
      } else {
        fs.unlinkSync(originalPath);
        return res.status(400).json({ error: 'Unsupported file type for conversion.' });
      }
      fs.unlinkSync(originalPath);
      finalPdfPath = convertedPdfPath;
    }

    const modifiedPdfFileName = `modified_${path.basename(finalPdfPath)}`;
    const modifiedPdfPath = `uploads/${modifiedPdfFileName}`;
    const modifiedFileUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${modifiedPdfFileName}`;

    const qrCodeDataUrl = await fileController.generateQRCode(modifiedFileUrl);
    await fileController.embedQRCodeInPdf(finalPdfPath, qrCodeDataUrl, modifiedPdfPath);

    if (fs.existsSync(finalPdfPath)) {
      fs.unlinkSync(finalPdfPath);
    }

    res.json({
      fileUrl: modifiedFileUrl,
      qrCodeUrl: qrCodeDataUrl,
      fileType: 'pdf',
    });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Error processing the file.' });
  }
});

// Fetch all files
router.get('/files', authentication, async (req, res) => {
  try {
    fs.readdir('uploads', async (err, files) => {
      if (err) return res.status(500).json({ error: 'Error reading uploads directory' });

      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      const fileDetails = await Promise.all(pdfFiles.map(async (file) => {
        const fileUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${file}`;
        const qrCodeUrl = await fileController.generateQRCode(fileUrl);
        return { fileName: file, fileUrl, qrCodeUrl };
      }));

      res.json(fileDetails);
    });
  } catch (err) {
    console.error('Fetch Files Error:', err);
    res.status(500).json({ error: 'Error fetching file details' });
  }
});

// Delete file by name
router.delete('/deleteByName/:fileName', authentication, async (req, res) => {
  const { fileName } = req.params;
  try {
    const filePath = `uploads/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully.' });
    } else {
      res.status(404).json({ error: 'File not found.' });
    }
  } catch (err) {
    console.error('Delete File Error:', err);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
