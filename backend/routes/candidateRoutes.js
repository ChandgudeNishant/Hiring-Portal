const express = require('express');
const multer = require('multer');
const { submitCandidate, uploadVideo, getCandidateInfo, downloadResume, getVideoUrl } = require('../controllers/candidateController');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Multer memory storage for file uploads
const storage = multer.memoryStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const resumeUpload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

const upload = multer({ storage: storage });

// Routes
router.post('/submit-form', resumeUpload.single('resume'), submitCandidate);
router.post('/submit-video', upload.single('video'), uploadVideo);
router.get('/:id', getCandidateInfo);
router.get('/download-resume/:id', downloadResume);
router.get('/:id/video', getVideoUrl);  

module.exports = router;
