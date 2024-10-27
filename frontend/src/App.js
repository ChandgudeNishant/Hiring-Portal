// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CandidateForm from './components/CandidateForm';
import VideoRecording from './components/VideoRecording';
import ReviewPage from './components/ReviewPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CandidateForm />} />
          <Route path="/record-video" element={<VideoRecording />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
