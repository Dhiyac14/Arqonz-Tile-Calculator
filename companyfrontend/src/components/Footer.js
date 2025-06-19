import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <img src="/logo.png" alt="ARQONZ Logo and Name" className="logo-img" />
          <p>
          From concept to completion & beyond, ArqonZ offers comprehensive solutions to elevate your Construction & interior business.<br />
          <span className="location">Chennai, India</span>
          </p>
        </div>

        <div className="footer-middle">
          <div className="footer-column">
            <h3>Explore</h3>
            <ul>
              <li><a href="https://arqonz.com/architects" target="_blank" rel="noopener noreferrer">Architects</a></li>
              <li><a href="https://arqonz.com/builders" target="_blank" rel="noopener noreferrer">Builders</a></li>
              <li><a href="https://arqonz.com/contractors" target="_blank" rel="noopener noreferrer">Contractors</a></li>
              <li><a href="https://arqonz.com/designers" target="_blank" rel="noopener noreferrer">Designers</a></li>
              <li><a href="https://arqonz.com/engineers" target="_blank" rel="noopener noreferrer">Engineers</a></li>
              <li><a href="https://arqonz.com/manufacturers" target="_blank" rel="noopener noreferrer">Manufacturers</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>About</h3>
            <ul>
              <li><a href="https://arqonz.com/about-us" target="_blank" rel="noopener noreferrer">About Us</a></li>
              <li><a href="https://quboyd.in/" target="_blank" rel="noopener noreferrer">Careers</a></li>
              <li><a href="https://arqonz.com/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
              <li><a href="https://arqonz.com/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms of Use</a></li>
              <li><a href="https://arqonz.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-right">
          <h3>Download Our App</h3>
          <div className="app-buttons">
            <a href="#"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" /></a>
            <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" /></a>
          </div>
        </div>
      </div>

      <p className="copyright">
        © Copyright © 2024 Arqonz | All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;
