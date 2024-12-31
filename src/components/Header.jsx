import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // Or any other icon library

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>In Browser Proctoring App</h1>
        <p>by Samarth Pal Antil</p> {/* Add your name here */}
      </div>
      <div className="social-links">
        <a href="https://www.linkedin.com/in/samarth-pal-antil/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin size={"2em"}/>
        </a>
        <a href="https://github.com/antil-samarth" target="_blank" rel="noopener noreferrer">
          <FaGithub size={"2em"}/>
        </a>
      </div>
    </header>
  );
};

export default Header;