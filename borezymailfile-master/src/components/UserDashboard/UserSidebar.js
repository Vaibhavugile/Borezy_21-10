import React from 'react';
import { Link, useLocation , useNavigate } from 'react-router-dom';
import './UseSidebar.css';
import { FaCalendarCheck, FaUsers, FaUser, FaPlusSquare, FaBoxOpen, FaRegFileAlt, FaMicrosoft, FaGift ,  } from 'react-icons/fa';
 import user from '../../assets/user.png';
const UserSidebar = ({ isOpen }) => {
  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    navigate('/');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        <ul>
          <li className="sidebar-greeting1">Welcome User,</li>
          <li className="sidebar-greeting">Leads</li>

          <li className={`sidebar-link ${location.pathname === '/usersidebar/billing' ? 'active' : ''}`}>
            <Link to="/usersidebar/billing" style={{ display: 'flex', alignItems: 'center' }}>
              <FaPlusSquare style={{ fontSize: '15px', color: '#757575', marginRight: '20px'}} />  Billing
            </Link>
          </li>

          <li className={`sidebar-link ${location.pathname === '/usersidebar/dashboard' ? 'active' : ''}`}>
            <Link to="/usersidebar/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
              <FaMicrosoft style={{ fontSize: '15px', color: '#757575', marginRight: '20px' }} />  Dashboard
            </Link>
          </li>
          
          <li className={`sidebar-link ${location.pathname === '/usersidebar/availability' ? 'active' : ''}`}>
            <Link to="/usersidebar/availability" style={{ display: 'flex', alignItems: 'center' }}>
              <FaCalendarCheck style={{ fontSize: '15px', color: '#757575', marginRight: '20px' }} />  Availability
            </Link>
          </li>
          
          <li className={`sidebar-link ${location.pathname === '/usersidebar/leads' ? 'active' : ''}`}>
            <Link to="/usersidebar/leads"style={{ display: 'flex', alignItems: 'center' }}>
              <FaUsers style={{ fontSize: '15px', color: '#757575', marginRight: '20px'  }} /> Leads
            </Link>
          </li>
          
          <li className={`sidebar-link ${location.pathname === '/usersidebar/clients' ? 'active' : ''}`}>
            <Link to="/usersidebar/clients"style={{ display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ fontSize: '15px', color: '#757575', marginRight: '20px' }} /> Clients
            </Link>
          </li>
          
          <li className={`sidebar-link ${location.pathname === '/addproduct' ? 'active' : ''}`}>
            <Link to="/productdashboard" style={{ display: 'flex', alignItems: 'center' }}>
              <FaGift style={{ fontSize: '15px', color: '#757575', marginRight: '20px' }} /> Product
            </Link>
          </li>
          
          <li className={`sidebar-link ${location.pathname === '/report' ? 'active' : ''}`}>
            <Link to="/report" style={{ display: 'flex', alignItems: 'center' }}>
              <FaRegFileAlt style={{ fontSize: '15px', color: '#757575', marginRight: '20px' }} /> Report
            </Link>
          </li>
          <li className="sidebar-link logout-button">
            <button onClick={handleLogout} className="logout-btn">
              <img src={user} alt="Logout" className="icon" /> Logout
            </button>
          </li>

        </ul>
      </nav>
    </div>
  );
};

export default UserSidebar;




