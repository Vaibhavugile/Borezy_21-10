import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    // Get user data from localStorage when the component mounts
    const savedUserData = localStorage.getItem('userData');
    return savedUserData ? JSON.parse(savedUserData) : null;
  });

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
