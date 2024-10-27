import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../services/api';
import "./style.css";

function VideoRecording() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [timer, setTimer] = useState(90);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false); 
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunks = useRef([]);
  const navigate = useNavigate();
  const countdownIntervalRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const candidateId = localStorage.getItem('candidateId');
  if (!candidateId) {
    console.error('No candidateId found in localStorage.');
  }

  const startCountdown = () => {
    setCountdown(3);
    setIsCountdownComplete(false);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (isPermissionGranted && mediaRecorder && mediaRecorder.state === 'inactive') {
      setRecording(true);
      setShowStopButton(true);
      chunks.current = [];
      mediaRecorder.start();
      setTimer(90);
      setIsCountdownComplete(true);

      recordingTimerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            stopRecording();
            clearInterval(recordingTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      mediaRecorder.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/mp4' });
        previewRef.current.src = URL.createObjectURL(blob);
        setShowPreview(true); 
        setShowControls(true);
      };
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      setRecording(false);
      setShowStopButton(false);
      mediaRecorder.stop();

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      clearInterval(recordingTimerRef.current);
      setShowControls(true);
    }
  };

  const handleUpload = async () => {
    const blob = new Blob(chunks.current, { type: 'video/mp4' });
    setLoading(true);

    try {
      await uploadVideo(blob, candidateId);
      navigate('/review');
    } catch (err) {
      setError('Error uploading video.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    chunks.current = [];
    setShowControls(false);
    setShowPreview(false); 
    setIsCountdownComplete(false);
    setTimer(90);
    getMediaPermissions(); 
  };

  const getMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      setIsPermissionGranted(true);
      videoRef.current.srcObject = stream;

      const mediaRec = new MediaRecorder(stream);
      setMediaRecorder(mediaRec);
    } catch (err) {
      setError('Error accessing camera and microphone.');
    }
  };

  useEffect(() => {
    getMediaPermissions();
    return () => {
      clearInterval(countdownIntervalRef.current);
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  return (
    <div className="video-recording-container">
      <h2 className="text-center">Record Your Introduction Video</h2>
      {error && <p className="text-danger">{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-100"
        style={{ borderRadius: '10px', display: showPreview ? 'none' : 'block' }} // Hide when preview is shown
      ></video>
      <video
        ref={previewRef}
        controls
        className="mt-3 w-100"
        style={{ display: showPreview ? 'block' : 'none', borderRadius: '10px' }} // Show only when recording stops
      ></video>

      <div className="mt-3">
        {loading ? (
          <p>Uploading... Please wait.</p>
        ) : (
          <>
            {recording && showStopButton ? (
              <>
                <button className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
                <p>Recording... Time left: {timer}s</p>
              </>
            ) : (
              isPermissionGranted && (
                <>
                  {countdown > 0 ? (
                    <h3>Recording starts in: {countdown}</h3>
                  ) : (
                    <>
                      {isCountdownComplete ? (
                        <>
                          {showStopButton && (
                            <>
                              <button className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
                              <p>Recording... Time left: {timer}s</p>
                            </>
                          )}
                        </>
                      ) : (
                        <button className="btn btn-primary" onClick={startCountdown}>Start Recording</button>
                      )}

                      {showControls && (
 <div className="video-recording-buttons">
 <button className="btn btn-success" onClick={handleUpload}>Upload Video</button>
 <button className="btn btn-secondary" onClick={handleRetake}>Retake</button>
</div>
                      )}
                    </>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VideoRecording;
