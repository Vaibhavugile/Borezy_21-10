import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cleads.css';
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';


const ClientLeads = () => {
  const [formData, setFormData] = useState({
    leadName: '', 
    mobileNo: '',
    requirement: '',
    eventDate: '',
    followupDate: '',
    source: 'google',
    stage: 'fresh lead',
    

  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCreateClientLead = async (e) => {
    e.preventDefault();

    const { leadName, mobileNo, requirement, eventDate, followupDate, source, stage, email,  } = formData;

    const today = new Date().toISOString().split('T')[0];
    if (new Date(followupDate) < new Date(today)) {
      toast.error('To Date cannot be in the past.');
      return;
    }

    try {
      await addDoc(collection(db, 'clientleads'), {
        leadName,
        mobileNo,
        requirement,
        eventDate,
        followupDate,
        source,
        stage,
        email,
         // Include new field
      });

      toast.success('Client lead created successfully.');
      setTimeout(() => {
        navigate('/usersidebar/leads');
      }, 1500);
    } catch (error) {
      toast.error('Failed to create client lead. Please try again.');
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`add-lead-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <div className="add-lead-content">
          <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
          <h2 style={{ marginLeft: '20px', marginTop: '70px' }}>
            Add lead
          </h2>
          <p className="subheading">Fill out the form below to add a new lead</p>
            <form onSubmit={handleCreateClientLead} >
            <form className="add-user-form">
              <div className="form-left">
                <div className='lead'>
                <div className="lead-details">
                  <label htmlFor="name">Lead Name</label>
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
                    <label htmlFor="contactno">Contact No.</label>
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
                          type="text" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="Enter Email-ID" 
                          required 
                      />
                  </div>
                  </div>

                  <div className="sub-left">
                    <label htmlFor="role">Next Follow-up Date</label>
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
                      <select className='opt'
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
                  
                  <select className='opt'
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
                  <label htmlFor="date">Event Date</label>
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
              
              <button type="submit" className="btn add-clead">Add Lead</button>
            </div>
            </form>
            <ToastContainer />
      </div>
    </div>
  );
};

export default ClientLeads;
