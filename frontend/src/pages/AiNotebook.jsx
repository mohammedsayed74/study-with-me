import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ai.css';

const AiNotebook = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [docsList, setDocsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch('/api/ai/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDocsList(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', file.name);

      const response = await fetch('/api/ai/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (response.ok) {
        setDocsList([data, ...docsList]);
        setFile(null);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-notebook-container">
      <div className="ai-top-actions">
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          &larr; Back to Dashboard
        </button>
      </div>
      <div className="ai-header">
        <h1>AI Study Notebook</h1>
        <p>Upload a PDF textbook or lecture notes, and let AI generate a study roadmap, flashcards, and answer your questions!</p>
      </div>

      <div className="ai-upload-section">
        <form onSubmit={handleUpload}>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
            disabled={loading}
          />
          <button type="submit" disabled={!file || loading} className="btn-primary">
            {loading ? 'Processing Document (This may take a minute)...' : 'Upload & Process PDF'}
          </button>
        </form>
      </div>

      <div className="ai-documents-list">
        <h2>Your Study Documents</h2>
        {docsList.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <div className="docs-grid">
            {docsList.map(doc => (
              <div key={doc._id} className="doc-card" onClick={() => navigate(`/ainotebook/${doc._id}`)}>
                <div className="doc-icon">📄</div>
                <div className="doc-info">
                  <h3>{doc.title}</h3>
                  <p>{new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiNotebook;
