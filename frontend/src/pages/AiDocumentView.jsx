import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';
import './ai.css';

const AiDocumentView = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, flashcards, chat
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDocumentDetails();
  }, [documentId]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const fetchDocumentDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/ai/documents/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDocument(data.document);
        setChatHistory(data.chatHistory || []);
      }
    } catch (error) {
      console.error("Failed to fetch document", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', text: message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/ai/chat/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.text })
      });
      
      const data = await response.json();
      if (response.ok) {
        setChatHistory(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="ai-loading">Loading document insights...</div>;
  if (!document) return <div className="ai-error">Document not found</div>;

  return (
    <div className="ai-doc-view-container">
      <div className="ai-top-actions">
        <button className="btn-secondary" onClick={() => navigate('/ainotebook')}>
          &larr; Back to Notebook
        </button>
      </div>
      <div className="doc-header">
        <h2>{document.title}</h2>
      </div>

      <div className="ai-tabs">
        <button className={activeTab === 'roadmap' ? 'active' : ''} onClick={() => setActiveTab('roadmap')}>Study Roadmap</button>
        <button className={activeTab === 'flashcards' ? 'active' : ''} onClick={() => setActiveTab('flashcards')}>Flashcards</button>
        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>AI Chat</button>
      </div>

      <div className="ai-tab-content">
        {activeTab === 'roadmap' && (
          <div className="roadmap-container">
            <h3>Generated Study Roadmap</h3>
            <ul className="roadmap-list">
              {document.roadmap?.map((item, index) => (
                <li key={index} className="roadmap-item">
                  <div className="roadmap-topic">{item.topic}</div>
                  <div className="roadmap-desc">{item.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="flashcards-container">
            <h3>Test Your Knowledge</h3>
            <div className="flashcards-grid">
              {document.flashcards?.map((card, index) => (
                <Flashcard key={index} question={card.question} answer={card.answer} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-container">
            <div className="chat-messages">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  <div className="msg-bubble">{msg.text}</div>
                </div>
              ))}
              {chatLoading && <div className="chat-message model"><div className="msg-bubble loading">AI is typing...</div></div>}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Ask a question about this document..."
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading || !message.trim()}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiDocumentView;
