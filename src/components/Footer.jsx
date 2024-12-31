import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="contact-info">
        <a href="mailto:antil.samarth@gmail.com">antil.samarth@gmail.com</a>
        <a href="https://www.linkedin.com/in/samarth-pal-antil/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/antil-samarth" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <div className="project-links">
        <a href="https://github.com/antil-samarth/browser-proctoring" target="_blank" rel="noopener noreferrer">Source Code</a>
        <a href="https://portfolio-rho-nine-83.vercel.app/" target="_blank" rel="noopener noreferrer">Portfolio</a>
      </div>
      <p>© {new Date().getFullYear()} Your Name. All rights reserved.</p>
    </footer>
  );
};

export default Footer;