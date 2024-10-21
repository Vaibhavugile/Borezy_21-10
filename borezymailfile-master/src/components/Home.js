// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to Renting Wala</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Home;
