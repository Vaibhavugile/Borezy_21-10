import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { sendEmail } from '../../utils/sendEmail';
import { useNavigate } from 'react-router-dom';
import './CreateSuperAdmin.css';

const CreateSuperAdmin = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [superAdmins, setSuperAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const fetchSuperAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'superadmins'));
      const adminsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuperAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching Super Admins:', error);
    }
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, name, password } = formData;

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Add Super Admin details to Firestore
      await addDoc(collection(db, 'superadmins'), {
        email,
        name,
        password, // Consider hashing the password or not storing it in plaintext
        role: 'superadmin',
        uid: user.uid,
      });

      // Send custom email notification
      await sendEmail(email, password, name, '', '', '');

      setSuccess('Super Admin created and verification email sent successfully.');
      setShowForm(false);
      fetchSuperAdmins(); // Fetch the updated list after adding a new Super Admin
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error creating Super Admin:', error);
      setError('Failed to create Super Admin. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      email: '',
      name: '',
      password: '',
    });
  };

  return (
    <div>
      <div className="super-admin-table">
        <h3>Recently Created Super Admin</h3>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {superAdmins.length > 0 ? (
              superAdmins.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.password}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No Data Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!showForm && (
        <div className="btn">
          <button className='btn1' onClick={() => setShowForm(true)}>Create New Super Admin</button>
        </div>
      )}

      {showForm && (
        <div>
          <h2>Create New Super Admin</h2>
          <form onSubmit={handleCreateSuperAdmin}>
            <div className='form'>
              <label>Name</label>
              <label>Email ID</label>
              <label>Password</label>
            </div>
            <br />
            <div className='input'>
              <input
                type="text"
                name="name"
                placeholder='Name'
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder='Email'
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder='Password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <br />
            <div className='btn-group'>
              <button className='btn1' type="submit">Confirm</button>
              <button className='Cancel' type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
          {error && <p>{error}</p>}
          {success && <p>{success}</p>}
        </div>
      )}
    </div>
  );
};

export default CreateSuperAdmin;
