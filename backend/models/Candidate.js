const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CandidateSchema = new Schema({
  firstName: String,
  lastName: String,
  position: String,
  currentPosition: String,
  experience: Number,
  resume: String,
});
const Candidate = mongoose.model('Candidate', CandidateSchema);

module.exports = Candidate;