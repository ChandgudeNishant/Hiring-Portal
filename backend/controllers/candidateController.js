const Candidate = require('../models/Candidate');
const Video = require('../models/Video');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.submitCandidate = async (req, res) => {
  const { firstName, lastName, position, currentPosition, experience } = req.body;

  if (!firstName || !lastName || !position || !currentPosition || !experience) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!req.file || req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Resume must be a PDF file.' });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Resume file size must not exceed 5MB.' });
  }

  try {
    const newCandidate = new Candidate({
      firstName,
      lastName,
      position,
      currentPosition,
      experience,
      resume: req.file.filename  
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    console.error('Error saving candidate:', error);
    res.status(500).json({ error: 'Error saving candidate information.' });
  }
};

exports.uploadVideo = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No file provided in the request' });
  }

  try {
    const candidateId = req.body.candidateId;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate ID format.' });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // Upload video to Cloudinary
    console.log('Starting video upload to Cloudinary...');
    cloudinary.uploader.upload_stream({ resource_type: 'video' }, async (error, result) => {
      if (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({ error: 'Error uploading to Cloudinary' });
      }

      // Generate the video title
      const videoTitle = `${candidate.firstName} ${candidate.lastName} video Intro`;

      try {
        // Save video metadata to MongoDB
        const video = new Video({
          title: videoTitle,
          videoUrl: result.secure_url,
          candidateId: candidate._id  // Associate with the candidate
        });

        await video.save();
        console.log('Video metadata saved to MongoDB.');
        res.status(201).json({ message: 'Video uploaded successfully', videoTitle });
      } catch (dbError) {
        console.error('Error saving video metadata to MongoDB:', dbError);
        res.status(500).json({ error: 'Error saving video metadata to database.' });
      }
    }).end(req.file.buffer);
  } catch (error) {
    console.error('Unexpected error in video upload:', error);
    res.status(500).json({ error: 'Unexpected error during video upload.' });
  }
};

exports.getCandidateInfo = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate ID format.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error('Error fetching candidate info:', error);
    res.status(500).json({ error: 'Error fetching candidate info.' });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate ID format.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || !candidate.resume) {
      return res.status(404).json({ error: 'Resume not found for this candidate.' });
    }

    const resumePath = path.join(__dirname, '../uploads', candidate.resume);

    res.download(resumePath, candidate.resume, (err) => {
      if (err) {
        console.error('Error downloading resume:', err);
        res.status(500).json({ error: 'Error downloading resume.' });
      }
    });
  } catch (error) {
    console.error('Error in downloadResume:', error);
    res.status(500).json({ error: 'Unexpected error while downloading resume.' });
  }
};

exports.getVideoUrl = async (req, res) => {
  try {
    const candidateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate ID format.' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    const videoTitle = `${candidate.firstName} ${candidate.lastName} video Intro`;
    const video = await Video.findOne({ title: videoTitle });

    if (!video) {
      return res.status(404).json({ error: 'Video not found for this candidate.' });
    }

    res.status(200).json({ videoUrl: video.videoUrl });
  } catch (error) {
    console.error('Error fetching video URL:', error);
    res.status(500).json({ error: 'Error fetching video URL.' });
  }
};
