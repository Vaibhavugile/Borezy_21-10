import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cleads.css';
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';


const EditCLead = () => {
  const { id } = useParams(); // Get the lead ID from the URL
  const [formData, setFormData] = useState({
    leadName: '',
    mobileNo: '',
    requirement: '',
    eventDate: '',
    followupDate: '',
    source: 'google',
    stage: 'fresh lead',
    email: '',
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };


const navigate = useNavigate();

  useEffect(() => {
    const fetchLead = async () => {
      const leadDocRef = doc(db, 'clientleads', id);
      const leadDoc = await getDoc(leadDocRef);

      if (leadDoc.exists()) {
        setFormData({ id, ...leadDoc.data() }); // Set form data with the lead data
      } else {
        toast.error('Lead not found.');
      }
    };

    fetchLead();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUpdateClientLead = async (e) => {
    e.preventDefault();

    try {
      const leadDocRef = doc(db, 'clientleads', id);
      await updateDoc(leadDocRef, formData);
      toast.success('Client lead updated successfully.');
      setTimeout(() => {
        navigate('/usersidebar/leads'); // Navigate back to the leads dashboard
      }, 1500);
    } catch (error) {
      toast.error('Failed to update client lead. Please try again.');
    }
  };

  return (
    <div className={`add-lead-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <div className="add-lead-content">
          <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
          <h2 style={{ marginLeft: '20px', marginTop: '70px' }}>
            Edit lead
          </h2>
      <p className="subheading">Fill out the form below to update the lead</p>
      <form onSubmit={handleUpdateClientLead}>
        <form className="add-user-form">
        <div className="form-left">
          <div className='lead'>
            <div className="lead-details">
              <label htmlFor="leadName">Lead Name</label>
              <input 
                type="text" 
                name="leadName" 
                value={formData.leadName} 
                onChange={handleChange} 
                placeholder="Enter Lead Name" 
                required 
              />
            </div>
            <div className="lead-details">
              <label htmlFor="mobileNo">Contact No.</label>
              <input 
                type="text" 
                name="mobileNo" 
                value={formData.mobileNo} 
                onChange={handleChange} 
                placeholder="Enter Mobile No" 
                required 
              />
            </div>
            <div className="lead-details">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter Email-ID" 
                required 
              />
            </div>
          </div>
          <div className="sub-left">
            <label htmlFor="followupDate">Next Follow-up Date</label>
            <input 
              type="datetime-local" 
              name="followupDate" 
              value={formData.followupDate} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="sub-right">
            <label htmlFor="stage">Status</label>
            <select 
              name="stage" 
              value={formData.stage} 
              onChange={handleChange} 
              required
            >
              <option value="fresh lead">Fresh Lead</option>
              <option value="requirement fulfilled">Requirement Fulfilled</option>
              <option value="not interested">Not Interested</option>
              <option value="interested">Interested</option>
            </select>
          </div>
        </div>

        <div className="form-right">
          <div className="requirement-field">
            <label htmlFor="require">Requirement</label>
            <input 
              type="text" 
              name="requirement" 
              value={formData.requirement} 
              onChange={handleChange} 
              placeholder="Enter Requirement" 
              required 
            />
          </div>
          <div className="source-field">
            <label htmlFor="source">Source</label>
            <select 
              name="source" 
              value={formData.source} 
              onChange={handleChange} 
              required
            >
              <option value="google">Google</option>
              <option value="walk in">Walk In</option>
              <option value="insta">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div className="eventdate-field">
            <label htmlFor="eventDate">Event Date</label>
            <input 
              type="date" 
              name="eventDate" 
              value={formData.eventDate} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="comment-field">
            <label htmlFor="comment">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Enter any comments here"
            />
          </div>
        </div>
        </form>
        <div className="button-group">
          <button onClick={() => navigate('/usersidebar/leads')} type="button" className="btn cancel">Cancel</button>
          <button type="submit" className="btn add-clead">Update Lead</button>
        </div>
      </form>
      <ToastContainer />
      </div>
    </div>
  );
};

export default EditCLead;
