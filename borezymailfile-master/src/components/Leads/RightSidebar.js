import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FaWhatsapp } from 'react-icons/fa';
import './RightSidebar.css'; // Adjust the path as per your directory structure

const RightSidebar = ({ isOpen, onClose, selectedLead }) => {
  const [status, setStatus] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [response, setResponse] = useState('');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  const templates = {
    'Details Shared': 'Thank you for your interest. Let us know if you have any further questions!',
    'Demo Scheduled': 'Hello, this is a reminder for your demo scheduled tomorrow.',
    'Demo Done': 'Congratulations! Your demo has been successfully completed.',
  };

  useEffect(() => {
    if (selectedLead) {
      setStatus(selectedLead.status || '');
      setNextFollowup(selectedLead.nextFollowup || '');
      setAssignedTo(selectedLead.assignedTo || '');
      setComments(selectedLead.comments || []);
    }
  }, [selectedLead]);

  const handleSave = async () => {
    if (newComment.trim() === '') return;

    try {
      const leadRef = doc(db, 'leads', selectedLead.id);
      const currentDateTime = new Date().toLocaleString();
      const commentWithTimestamp = `${currentDateTime}: ${newComment}`;

      await updateDoc(leadRef, {
        status,
        nextFollowup,
        assignedTo,
        comments: arrayUnion(commentWithTimestamp),
        response,
      });

      alert('Lead updated successfully!');
      setComments([...comments, commentWithTimestamp]);
      setNewComment('');
      onClose();
    } catch (error) {
      console.error('Error updating lead: ', error);
      alert('Failed to update lead. Please try again.');
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateBody(templates[template] || '');
  };

  const handleTemplateBodyChange = (event) => {
    setTemplateBody(event.target.value);
  };

  const handleSendTemplate = () => {
    const whatsappLink = `https://api.whatsapp.com/send?phone=${selectedLead.contactNumber}&text=${encodeURIComponent(templateBody)}`;
    window.open(whatsappLink, '_blank');
    setIsOverlayOpen(false);
  };

  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen);
  };

  return (
    <div className={`right-sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <div className="sidebar-content">
        <h2>Business Details</h2>
        <div className="sidebar-row">
          <div className="sidebar-item">
            <h3>Business Name:</h3>
            <p>{selectedLead?.businessName}</p>
          </div>
          <div className="sidebar-item">
            <h3>Business Type:</h3>
            <p>{selectedLead?.businessType}</p>
          </div>
        </div>
        <div className="sidebar-row">
          <div className="sidebar-item">
            <h3>Contact:</h3>
            <p>{selectedLead?.contactNumber}</p>
          </div>
          <div className="sidebar-item">
            <h3>Email ID:</h3>
            <p>{selectedLead?.emailId}</p>
          </div>
        </div>
        <div className="sidebar-row">
          <div className="sidebar-item">
            <h3>Status:</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="details shared">Details Shared</option>
              <option value="demo scheduled">Demo Scheduled</option>
              <option value="demo done">Demo Done</option>
              <option value="lead won">Lead Won</option>
              <option value="lead lost">Lead Lost</option>
            </select>
          </div>
          <div className="sidebar-item">
            <h3>Next Follow-up Date:</h3>
            <input
              type="date"
              value={nextFollowup ? new Date(nextFollowup).toISOString().split('T')[0] : ''}
              onChange={(e) => setNextFollowup(e.target.value)}
            />
          </div>
        </div>
        <div className="sidebar-row">
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="attended"
                checked={response === 'attended'}
                onChange={(e) => setResponse(e.target.value)}
              />
              Attended
            </label>
            <label>
              <input
                type="radio"
                value="rejected"
                checked={response === 'rejected'}
                onChange={(e) => setResponse(e.target.value)}
              />
              Rejected
            </label>
            <label>
              <input
                type="radio"
                value="postponed"
                checked={response === 'postponed'}
                onChange={(e) => setResponse(e.target.value)}
              />
              Postponed
            </label>
            <label>
              <input
                type="radio"
                value="no reply"
                checked={response === 'no reply'}
                onChange={(e) => setResponse(e.target.value)}
              />
              No Reply
            </label>
          </div>
        </div>
        <div className="sidebar-row">
          <div className="sidebar-item">
            <h3>Assigned To:</h3>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
        </div>
        <div className="sidebar-row full-width-row">
          <div className="sidebar-item full-width">
            <h3>Add a Comment:</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment here..."
              className="comment-input"
            />
          </div>
        </div>
        <div className="sidebar-row full-width-row">
          <div className="sidebar-item full-width">
            <h3>Previous Comments:</h3>
            {comments && comments.length > 0 ? (
              <ul className="comments-list">
                {comments.map((comment, index) => (
                  <li key={index}>{comment}</li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>
        <div className="sidebar-row full-width-row">
          <div className="save-button-container">
            <button className="save-button" onClick={handleSave}>Save</button>
            <div className="whatsapp-container">
              <FaWhatsapp 
                size={30} 
                color="#25D366" 
                className="whatsapp-icon" 
                onClick={toggleOverlay} 
              />
              {isOverlayOpen && (
                <>
                  <div className="overlay-background" onClick={toggleOverlay}></div>
                  <div className="overlay-box">
                    <h3>Select a Template</h3>
                    <select 
                      value={selectedTemplate} 
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">Select Template</option>
                      {Object.keys(templates).map((templateName, index) => (
                        <option key={index} value={templateName}>
                          {templateName}
                        </option>
                      ))}
                    </select>
                    {selectedTemplate && (
                      <div className="template-editor">
                        <textarea
                          value={templateBody}
                          onChange={handleTemplateBodyChange}
                          className="template-textarea"
                        />
                        <button onClick={handleSendTemplate} className="send-button">
                          Send via WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
