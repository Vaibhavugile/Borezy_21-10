import React, { useState } from 'react';
import { collection, addDoc,setDoc, doc  } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { sendEmail } from '../../utils/sendEmail';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the default CSS for Toastify
import './createBranch.css'; // Using the same CSS file

const CreateBranch = () => {
  const [formData, setFormData] = useState({
    emailId: '',
    branchCode: '',
    branchName: '',
    ownerName: '',
    subscriptionType: 'monthly',
    activeDate: '',
    deactiveDate: '',
    numberOfUsers: 5,
    amount: '',
    password: '',
    location: '',
  });
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();

    const { emailId, branchCode, branchName, ownerName, subscriptionType, activeDate, deactiveDate, numberOfUsers, amount, password, location } = formData;

    if (new Date(activeDate) < new Date(today)) {
      toast.error('Start date cannot be before today.');
      return;
    }

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, emailId, password);

      await setDoc(doc(db, 'branches',branchCode), {
        emailId,
        branchCode,
        branchName,
        ownerName,
        subscriptionType,
        activeDate,
        deactiveDate,
        numberOfUsers,
        amount,
        password,
        location
      });

      await sendEmail(emailId, password, ownerName, activeDate, deactiveDate, amount);

      toast.success('Branch created, user account set up, and email sent successfully.');
      setFormData({ // Reset form data on success
        emailId: '',
        branchCode: '',
        branchName: '',
        ownerName: '',
        subscriptionType: 'monthly',
        activeDate: '',
        deactiveDate: '',
        numberOfUsers: 5,
        amount: '',
        password: '',
        location: '',
      });

      setTimeout(() => {
        navigate('/branches'); // Navigate after a short delay
      }, 1500); // Adjust the delay as needed
    } catch (error) {
      console.error('Error creating branch or user:', error);
      toast.error('Failed to create branch or user. Please try again.');
    }
  };

  return (
    <div className="create-branch">
      <h2>Add A Branch</h2>
      <form onSubmit={handleCreateBranch}>
        <div className="field-row">
          <div>
            <label>Email ID</label>
            <input 
              type="email" 
              name="emailId" 
              value={formData.emailId} 
              onChange={handleChange} 
              placeholder="Enter Email ID" 
              required 
            />
          </div>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Enter Password" 
              required 
            />
          </div>
        </div>
        <div className="field-row">
          <div>
            <label>Branch Code</label>
            <input 
              type="text" 
              name="branchCode" 
              value={formData.branchCode} 
              onChange={handleChange} 
              placeholder="Enter Branch Code" 
              required 
            />
          </div>
          <div>
            <label>Location</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Enter Location" 
              required 
            />
          </div>
        </div>
        <label>Branch Name</label>
        <input 
          type="text" 
          name="branchName" 
          value={formData.branchName} 
          onChange={handleChange} 
          placeholder="Enter Branch Name" 
          required 
        />
        
        <label>Owner Name</label>
        <input 
          type="text" 
          name="ownerName" 
          value={formData.ownerName} 
          onChange={handleChange} 
          placeholder="Enter Owner Name" 
          required 
        />
        
        <label>Subscription Type</label>
        <select 
          name="subscriptionType" 
          value={formData.subscriptionType} 
          onChange={handleChange} 
          requireda
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        
        <div className="date-fields-container">
          <div>
            <label>Start Date</label>
            <input 
                type="date" 
                name="activeDate" 
                value={formData.activeDate} 
                onChange={handleChange} 
                min={today} 
                required 
            />
          </div>
          <div>
            <label>End Date</label>
            <input 
                type="date" 
                name="deactiveDate" 
                value={formData.deactiveDate} 
                onChange={handleChange} 
                required 
            />
          </div>
        </div>

        <div className="number-of-users-amount-container">
          <div className="number-of-users-container">
            <label htmlFor="numberOfUsers">Number of Users</label>
            <input
              type="number"
              id="numberOfUsers"
              name="numberOfUsers"
              value={formData.numberOfUsers}
              onChange={handleChange}
            />
          </div>
          <div className="amount-container">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit">Create Branch</button>
      </form>

      <ToastContainer /> {/* Add this to render the toast notifications */}
    </div>
  );
};

export default CreateBranch;
