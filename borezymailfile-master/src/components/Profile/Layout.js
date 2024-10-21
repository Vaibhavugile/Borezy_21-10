import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useUser } from '../Auth/UserContext'; // Import the context
import logo from '../../assets/profile-logo.png';
import './Profile.css';

const NavigationItem = ({ to, label }) => (
  <li>
    <NavLink to={to}>{label}</NavLink>
  </li>
);

const Layout = () => {
  const { userData } = useUser(); // Access userData from the context

  const isBranchManager = userData.role === 'Branch Manager';
  const isSuperAdmin = userData.role === 'Super Admin';
  const issubusers = userData.role === 'Subuser ';


  return (
    <div className="dashboard-container1">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="BOREZY Logo" />
        </div>
        <div className="profile">
          <h3>{userData.name}</h3> {/* Display the user name */}
          <p>{userData.branchName}</p> {/* Display the branch name */}
        </div>
      </header>
      
      <div className='profile1'>
        <nav>
          <ul>
            <NavigationItem to={isBranchManager ? "/overview" : "/profile"} label="Overview" />

            <NavigationItem to={isSuperAdmin ? "/superadmin" : "/usersidebar/users"} label={isSuperAdmin ? "Super Admin" : "Create Users"} />

            <NavigationItem to="/transaction" label="Transaction" />

            {isBranchManager ? (
              <NavigationItem to="/change-password" label="Change Password" /> // Link to Change Password
            ) : (
              <NavigationItem to="/change-password" label="Change Password" /> // Link to Settings
      
            )}
            {issubusers ? (
              <NavigationItem to="/change-password" label="Change Password" /> // Link to Change Password
            ) : (
              <NavigationItem to="/change-password" label="Change Password" /> // Link to Settings
      
            )}
          </ul>
        </nav>
      </div>
      
      <main>
        <Outlet /> {/* Render the nested route content here */}
      </main>
    </div>
  );
};

export default Layout;
