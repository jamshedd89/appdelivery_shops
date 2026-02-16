const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const router = Router();
router.post('/', auth, upload.array('files', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files' });
  res.json({ success: true, data: { urls: req.files.map((f) => `/uploads/${f.filename}`) } });
});
module.exports = router;
