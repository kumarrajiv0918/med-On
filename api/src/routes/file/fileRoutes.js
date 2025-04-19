const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../../controllers/file/fileController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
router.use('/uploads', express.static('uploads'));

router.post('/upload', upload.single('file'), async (req, res) => {
  const originalPath = `uploads/${req.file.filename}`;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const baseName = path.basename(req.file.filename, ext);
  const convertedPdfPath = `uploads/${baseName}_converted.pdf`;

  try {
    let finalPdfPath = originalPath;
    if (ext !== '.pdf') {
      if (['.doc', '.docx', '.xls', '.ppt', '.pptx'].includes(ext)) {
        await fileController.convertToPdf(originalPath, convertedPdfPath);
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        await fileController.imageToPdf(originalPath, convertedPdfPath);
      } else {
        throw new Error('Unsupported file type for conversion.');
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
    console.error('Error:', err);
    res.status(500).json({ error: 'Error processing the file.' });
  }
});
router.get('/files', async (req, res) => {
  try {
    fs.readdir('uploads', async (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching files' });
      }
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      const fileDetails = [];
      for (let file of pdfFiles) {
        const fileUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${file}`;
        const qrCodeUrl = await fileController.generateQRCode(fileUrl); 

        fileDetails.push({
          fileName: file,
          fileUrl: fileUrl,
          qrCodeUrl: qrCodeUrl, 
        });
      }
      res.json(fileDetails);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error fetching file details' });
  }
});


router.delete('/deleteByName/:fileName', async (req, res) => {
    const { fileName } = req.params;
    try {
      // Delete from database (if used)
      // await FileModel.deleteOne({ fileName });
  
      // Delete file from uploads
      const fs = require('fs');
      const filePath = `./uploads/${fileName}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
  
      res.status(200).json({ message: 'File deleted' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Delete failed' });
    }
  });
module.exports = router;
