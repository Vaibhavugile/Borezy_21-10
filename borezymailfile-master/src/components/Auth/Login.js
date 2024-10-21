import React, { useState, useEffect } from 'react';
import { Button, Checkbox, TextField, IconButton, InputAdornment } from '@mui/material';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate,Link } from 'react-router-dom';
import { useUser } from './UserContext'; // Import the context
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './login.css';
import { CircularProgress } from '@mui/material';
import Logo from '../../assets/Bore.jpg';
import BgAbstract from '../../assets/sd.jpg';
import { fetchRealTimeDate } from '../../utils/fetchRealTimeDate';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const { setUserData } = useUser(); // Access setUserData from the context
  const [email, setEmail] = useState(localStorage.getItem('userEmail') ? JSON.parse(localStorage.getItem('userEmail')) : '');
  const [password, setPassword] = useState(localStorage.getItem('userPassword') ? JSON.parse(localStorage.getItem('userPassword')) : '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        try {
          const auth = getAuth();
          const user = await auth.verifyIdToken(token);
          if (user) {
            setUserData({ name: user.name, role: user.role, email: user.email });
            navigate(user.role === 'Super Admin' ? '/admin-dashboard' : '/user-dashboard');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      }
    };
    checkAuthToken();
  }, [setUserData, navigate]);

  // Auto-fill email and password from storage
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const savedPassword = localStorage.getItem('userPassword') || sessionStorage.getItem('userPassword');
    
    if (savedEmail && savedPassword) {
      setEmail(JSON.parse(savedEmail));
      setPassword(JSON.parse(savedPassword));
    }
  }, []);

  // Session timeout logic (e.g., 30 minutes)
  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      navigate('/login'); // Redirect to login on session timeout
    }, 30 * 60 * 1000); // 30 minutes timeout

    return () => clearTimeout(sessionTimeout); // Cleanup on component unmount
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', JSON.stringify(email));
        localStorage.setItem('userPassword', JSON.stringify(password)); // Save password
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userEmail', JSON.stringify(email));
        sessionStorage.setItem('userPassword', JSON.stringify(password)); // Save password
      }

      // Check if the user is a Super Admin
      const superAdminQuery = query(collection(db, 'superadmins'), where('email', '==', email));
      const superAdminSnapshot = await getDocs(superAdminQuery);

      if (!superAdminSnapshot.empty) {
        const superAdminData = superAdminSnapshot.docs[0].data();
        setUserData({ name: superAdminData.name, role: 'Super Admin', email });
        navigate('/leads');
        return;
      }

      // Check if the user is a Branch Manager
      const branchQuery = query(collection(db, 'branches'), where('emailId', '==', email));
      const branchSnapshot = await getDocs(branchQuery);

      if (!branchSnapshot.empty) {
        const branchData = branchSnapshot.docs[0].data();
        const today = await fetchRealTimeDate();

        const branchActiveDate = new Date(branchData.activeDate);
        const branchDeactiveDate = new Date(branchData.deactiveDate);

        if (today < branchActiveDate) {
          setError('Branch plan not active.');
          setLoading(false);
          return;
        }

        if (today > branchDeactiveDate) {
          setError('Branch plan is expired.');
          setLoading(false);
          return;
        }

        if (branchData.firstLogin) {
          navigate('/change-password');
          return;
        }

        setUserData({
          name: branchData.ownerName,
          role: 'Branch Manager',
          email,
          branchCode: branchData.branchCode,
          branchName: branchData.branchName,
          numberOfUsers: branchData.numberOfUsers,
        });
        navigate('/welcome');
        return;
      }

      // Check if the user is a Subuser
      const subuserQuery = query(collection(db, 'subusers'), where('email', '==', email));
      const subuserSnapshot = await getDocs(subuserQuery);

      if (!subuserSnapshot.empty) {
        const subuserData = subuserSnapshot.docs[0].data();
        const today = await fetchRealTimeDate();

        // Check if the subuser is active
        if (!subuserData.isActive) {
          setError('Subuser account is inactive. Contact your branch owner.');
          setLoading(false);
          return;
        }

        const subuserActiveDate = new Date(subuserData.activeDate);
        const subuserDeactiveDate = new Date(subuserData.deactiveDate);

        if (today < subuserActiveDate) {
          setError('Subuser plan not active. Contact your branch owner.');
          setLoading(false);
          return;
        }

        if (today > subuserDeactiveDate) {
          setError('Subuser plan is expired. Contact your branch owner.');
          setLoading(false);
          return;
        }

        // Check the associated branch status
        const branchRef = collection(db, 'branches');
        const branchQuery = query(branchRef, where('branchCode', '==', subuserData.branchCode));
        const branchSnapshot = await getDocs(branchQuery);

        if (!branchSnapshot.empty) {
          const branchData = branchSnapshot.docs[0].data();

          const branchActiveDate = new Date(branchData.activeDate);
          const branchDeactiveDate = new Date(branchData.deactiveDate);

          if (!subuserData.isActive) {
            setError('Subuser account is inactive. Contact your branch owner.');
            setLoading(false);
            return;
          }
          if (today < branchActiveDate) {
            setError('Branch plan not active. Contact your branch owner.');
            setLoading(false);
            return;
          }

          if (today > branchDeactiveDate) {
            setError('Branch plan is expired. Contact your branch owner.');
            setLoading(false);
            return;
          }

          setUserData({
            name: subuserData.name,
            role: 'Subuser',
            email,
            branchCode: subuserData.branchCode,
          });
          navigate('/welcome');
          return;
        } else {
          setError('Associated branch not found. Contact your branch owner.');
          setLoading(false);
          return;
        }
      }

      setError('No user found with the provided credentials.');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
    <div className="sign-in-right">
      <div className="welcome-text">
        Welcome to <span className="highlighted-text">BOREZY</span> <br />
        Booking. Rentals. Made Eazy.
      </div>

      <h5>Login</h5>
      <p>Welcome back! Please sign in to your account</p>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <TextField
            label="Email ID"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaEnvelope />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="input-group">
          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaLock /> {/* Start adornment for the lock icon */}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ background: 'transparent' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="remember-me">
          <Checkbox
            checked={rememberMe}
            onChange={() => setRememberMe((prev) => !prev)}
          />
          <label>Remember Me</label>
        </div>

        <p> <Link to="/forgot-password">Forgot your password?</Link></p>

        <Button 
className="sign-in-button" 
fullWidth 
variant="contained" 
type="submit" 
disabled={loading}
startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} // Conditionally show spinner
>
{loading ? 'Logging-in...' : 'Login'}
</Button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>

    <div className="sign-in-left">
      <h1>The simplest way to manage your workforce</h1>
    </div>

    <div className="logo-container">
      <img src={Logo} alt="Logo" className="logo-image" />
    </div>
  </div>
  );
};

export default Login;
