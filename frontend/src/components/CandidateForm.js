import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitCandidateForm } from '../services/api';

function CandidateForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    currentPosition: '',
    experience: '',
    resume: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.resume.size > 5 * 1024 * 1024) {
        setError('Resume file size exceeds 5MB');
        return;
      }

      const response = await submitCandidateForm(formData);

      localStorage.setItem('candidateId', response.data._id);
      navigate('/record-video');  
    } catch (error) {
      setError('Error submitting form');
    }
  };

  return (
    <div className="candidate-form-container">
        <h2 className="text-center mb-4">Submit Candidate Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input type="text" name="firstName" className="form-control" required onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input type="text" name="lastName" className="form-control" required onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Position Applied For</label>
            <input type="text" name="position" className="form-control" required onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Current Position</label>
            <input type="text" name="currentPosition" className="form-control" required onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Experience (Years)</label>
            <input type="number" name="experience" className="form-control" required onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Upload Resume (PDF only, max 5MB)</label>
            <input type="file" className="form-control" accept=".pdf" required onChange={handleFileChange} />
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          <button type="submit" className="btn btn-primary w-100">Next</button>
        </form>
    </div>
  );
}

export default CandidateForm;