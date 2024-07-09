import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if a token exists in local storage when the component mounts
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'http://localhost:3002/api/auth/login' : 'http://localhost:3002/api/auth/signup';
      const response = await axios.post(endpoint, { email, password });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      alert('Success');
    } catch (error) {
      console.error('Error:', error.response.data);
      alert('Error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('Logged out successfully');
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <h2>Welcome!</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
          </button>
        </>
      )}
    </div>
  );
};

export default LoginPage;