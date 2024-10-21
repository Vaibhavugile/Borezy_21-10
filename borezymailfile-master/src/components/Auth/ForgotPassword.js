import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { sendPasswordResetEmailWithLink } from '../../utils/sendEmail'; // Import the new function
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const auth = getAuth();
    try {
      // Generate the password reset link with Firebase
      await sendPasswordResetEmail(auth, email);
      
      // You can directly call EmailJS here to send a custom reset email
      const resetLink = `https://your-app-url/reset-password?email=${email}`; // Example reset link
      await sendPasswordResetEmailWithLink(email, resetLink);  // Call the custom email function

      setSuccess('Password reset email has been sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleResetPassword}>
        <div className="form-group">
          <label htmlFor="email">Enter your email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <button type="submit" className="reset-button">Reset Password</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
