import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/candidates';

export const submitCandidateForm = async (formData) => {
  const data = new FormData();
  Object.keys(formData).forEach((key) => data.append(key, formData[key]));
  return await axios.post(`${API_BASE}/submit-form`, data);
};

export const uploadVideo = async (videoBlob, candidateId) => {
  if (!candidateId) {
    throw new Error('Candidate ID is missing. Ensure the candidate form was submitted successfully.');
  }
  const data = new FormData();
  data.append('video', videoBlob);
  data.append('candidateId', candidateId);

  return await axios.post(`${API_BASE}/submit-video`, data);
};

export const getCandidateInfo = async () => {
  const candidateId = localStorage.getItem('candidateId');
  if (!candidateId) throw new Error('No candidate ID found.');
  const response = await axios.get(`${API_BASE}/${candidateId}`);
  return response.data;
};

export const getVideoUrl = async () => {
  const candidateId = localStorage.getItem('candidateId');
  if (!candidateId) throw new Error('No candidate ID found.');
  const response = await axios.get(`${API_BASE}/${candidateId}/video`);
  return response.data;
};
