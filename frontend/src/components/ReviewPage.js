import React, { useState, useEffect } from 'react';
import { getCandidateInfo, getVideoUrl } from '../services/api';

function ReviewPage() {
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const candidateData = await getCandidateInfo();
        const videoData = await getVideoUrl();
        setCandidateInfo(candidateData);
        setVideoUrl(videoData.videoUrl);
      } catch (err) {
        setError('Failed to load candidate information.');
      }
    }
    fetchData();
  }, []);


const handleDownloadResume = () => {
  if (candidateInfo && candidateInfo.firstName && candidateInfo.lastName) {
    const resumeUrl = `http://localhost:5000/api/candidates/download-resume/${candidateInfo._id}`;
    const link = document.createElement('a');
    link.href = resumeUrl;

    const firstName = candidateInfo.firstName.trim().replace(/ /g, '_');
    const lastName = candidateInfo.lastName.trim().replace(/ /g, '_');
    const fileName = `${firstName}_${lastName}_resume.pdf`; 

    console.log(`First Name: ${firstName}, Last Name: ${lastName}, Download Filename: ${fileName}`);

    link.download = fileName; 

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    setError('Candidate information not available.');
  }
};


  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      {candidateInfo ? (
        <>
          <h2>Review Your Submission</h2>
          <p><strong>First Name:</strong> {candidateInfo.firstName}</p>
          <p><strong>Last Name:</strong> {candidateInfo.lastName}</p>
          <p><strong>Position Applied For:</strong> {candidateInfo.position}</p>
          <p><strong>Current Position:</strong> {candidateInfo.currentPosition}</p>
          <p><strong>Experience:</strong> {candidateInfo.experience} years</p>

          <p className="resume-section">
  <strong>Resume:</strong>
  <button 
    onClick={handleDownloadResume} 
    className="btn btn-primary"
  >
    Download Resume
  </button>
</p>


          <h3>Your Video</h3>
          <video controls src={videoUrl}></video>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ReviewPage;
