import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore methods
import { db } from '../../firebaseConfig'; // Firebase config
import { useNavigate } from 'react-router-dom'; // Navigation
import { useUser } from '../Auth/UserContext'; // Access user data from context
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import './Adduser.css';

const AddUser = () => {
  const { userData } = useUser(); // Get user data from context
  const navigate = useNavigate(); // For navigation

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Subuser'); // Default role set to "Subuser"
  const [permission, setPermission] = useState('');
  const [date, setDate] = useState('');
  const [branchCode, setBranchCode] = useState(''); // Store branch code
  const [userLimitReached, setUserLimitReached] = useState(false); // State to track user limit

  // Redirect if the user is not authorized
  useEffect(() => {
    if (!userData || (userData.role !== 'Super Admin' && userData.role !== 'Branch Manager')) {
      navigate('/'); // Redirect to home or another page if unauthorized
    }
  }, [userData, navigate]);

  // Directly set branchCode if userData is available
  useEffect(() => {
    if (userData && userData.branchCode) {
      setBranchCode(userData.branchCode);
      console.log('Fetched branch code:', userData.branchCode); // Debugging

      // Fetch the corresponding branch document using branchCode
      const fetchBranchData = async () => {
        const branchRef = doc(db, 'branches', userData.branchCode);
        const branchSnap = await getDoc(branchRef);

        if (branchSnap.exists()) {
          const branchData = branchSnap.data();
          const currentUsers = branchData.numberOfUsers || 0;
          console.log('Current number of users:', currentUsers);

          if (currentUsers === 0) {
            setUserLimitReached(true); // Set user limit reached if numberOfUsers is zero
          } else {
            setUserLimitReached(false);
          }
        } else {
          console.error('Branch not found. Branch Code:', branchCode);
        }
      };

      fetchBranchData();
    }
  }, [userData, branchCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user limit is reached
    if (userLimitReached) {
      alert('User limit reached. No more users can be added.');
      return;
    }

    // Prepare new user data
    try {
      const auth = getAuth();
      // Create authenticated user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Prepare new user data to be stored in Firestore
      const newUser = {
        userId, // Store the Firebase Auth user ID
        name,
        email,
        salary,
        contactNumber,
        password,
        role, // Role is now 'Subuser' by default
        permission,
        date,
        isActive: true, // User is active by default
        branchCode,
      };

      // Add new user to Firestore 'subusers' collection
      await addDoc(collection(db, 'subusers'), newUser);
      console.log('User added successfully.');

      // Update the branch's user count
      const branchRef = doc(db, 'branches', branchCode);
      const branchSnap = await getDoc(branchRef);

      if (branchSnap.exists()) {
        const branchData = branchSnap.data();
        const currentUsers = branchData.numberOfUsers || 0;

        await updateDoc(branchRef, {
          numberOfUsers: Math.max(0, currentUsers - 1), // Ensure user count doesn't go below 0
        });
        console.log('Branch user count updated.');
      } else {
        console.error('Branch not found. Branch Code:', branchCode);
      }

      // Reset form fields
      setName('');
      setEmail('');
      setSalary('');
      setContactNumber('');
      setPassword('');
      setRole('Subuser');
      setPermission('');
      setDate('');

      // Redirect to users list after success
      alert('User added successfully');
      navigate('/usersidebar/users');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleCancel = () => {
    navigate('/usersidebar/users'); // Redirect to user dashboard on cancel
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      <p className="subheading">Fill out the form below to add a new user to your account</p>

      {userLimitReached && (
        <p className="error-message">User limit reached. No more users can be added to this branch.</p>
      )}

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email id"
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Enter salary"
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="datetime-local"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label>Branch Code</label>
            <input
              type="text"
              value={branchCode}
              readOnly
              placeholder="Branch code"
            />
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter mobile number"
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={userLimitReached}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              value={role}
              readOnly
              placeholder="Subuser"
            />
          </div>
          
        </div>

        <div className="button-group">
          <button
            type="button"
            className="btn cancel"
            onClick={handleCancel}
            disabled={userLimitReached}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn add-employee"
            disabled={userLimitReached}
          >
            Add User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
