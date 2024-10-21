import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo1 from '../../assets/screenshot-20240801-at-125204-pmremovebgpreview-1@2x.png';
import profileIcon from '../../assets/Profile.png';
import menuImage from '../../assets/Menu.png';
import './Header.css';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate(); // Use useNavigate for navigation
  const location = useLocation();

  // List of routes where the header should be hidden
  const hiddenRoutes = ['/login', '/signup', '/profile'];
  const shouldHideHeader = hiddenRoutes.includes(location.pathname);

  return (
    <header className={`header1 ${isSidebarOpen ? 'sidebar-open' : ''} ${shouldHideHeader ? 'hidden' : ''}`}>
      <button className="menu-button" onClick={onMenuClick}>
        <img className='menu-image' src={menuImage} alt="Menu" />
      </button>
      <div className="header-logo">
        <img src={logo1} alt="Logo" />
      </div>
      <div className="header-profile">
        <img
          src={profileIcon}
          alt="Profile"
          onClick={() => navigate('/profile')} // Navigate to the profile page
        />
      </div>
    </header>
  );
};

export default Header;
