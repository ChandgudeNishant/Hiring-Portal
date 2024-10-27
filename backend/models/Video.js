const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  videoUrl: String
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;