import React, { useState } from 'react';
import UserHeader from './UserHeader'; // Import the Header component
import UserSidebar from './UserSidebar'; // Import the Sidebar component
import './UserDashboard.css'; // Import the CSS file

const UserDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar toggle

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

  return (
    <div className="dashboard-layout-user">
      {/* Pass toggleSidebar to Header */}
      <UserHeader onMenuClick={toggleSidebar} />

      <div className="dashboard-body-user">
        {/* Pass isSidebarOpen as a prop to UserSidebar */}
        <UserSidebar isOpen={isSidebarOpen} /> 

        {/* Adjust content width based on the sidebar state */}
        <div className={`dashboard-content-user ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <h3>Welcome to the User Dashboard</h3>
          <p>This is where you can add user-specific features and content.</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
