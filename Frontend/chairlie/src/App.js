//import './App.css';
import React, { useState } from 'react';
import ChatPage from './components/ChatPage';
import LoginPage from './components/LoginPage';

function App() {
  const [showLoginPage, setShowLoginPage] = useState(true);

  function renderComponent() {
    setShowLoginPage(prevState => !prevState);
  }
  return (
    <div className="App">
      <button onClick={renderComponent}>
        {showLoginPage ? 'Go to Chat Page' : 'Go to Login Page'}
      </button>
      <header className="App-header">
      {showLoginPage ? <LoginPage /> : <ChatPage />}
      </header>
    </div>
  );
}

export default App;
