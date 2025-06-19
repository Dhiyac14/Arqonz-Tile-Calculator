import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src="/logo.png" alt="ARQONZ Logo and Name" className="logo-img" style={{height: '48px', width: 'auto'}} />
      </div>
      <nav className="nav-links">
        <a href="https://arqonz.com/" target="_blank" rel="noopener noreferrer">Home</a>
        <div className="dropdown">
          <a href="#" className="dropdown-toggle">Tools</a>
          <div className="dropdown-menu">
            <a href="/" style={{display: 'block', padding: '10px 24px', color: '#333', fontWeight: 400}}>Tile Calculator</a>
            <a href="https://arqonz.com/calculator/wallpaper-calculator" target="_blank" rel="noopener noreferrer">Wallpaper Calculator</a>
            <a href="https://arqonz.com/calculator/paint-calculator" target="_blank" rel="noopener noreferrer">Paint Calculator</a>
            <a href="https://arqonz.com/calculator/brick-calculator" target="_blank" rel="noopener noreferrer">Brick Calculator</a>
            <a href="https://arqonz.com/calculator/wall-plaster-calculator" target="_blank" rel="noopener noreferrer">Wall Plaster Calculator</a>
            <a href="https://arqonz.com/calculator/concrete-calculator" target="_blank" rel="noopener noreferrer">Concrete Calculator</a>
            <a href="https://arqonz.com/calculator/length-converter" target="_blank" rel="noopener noreferrer">Length Converter</a>
            <a href="https://arqonz.com/calculator/area-converter" target="_blank" rel="noopener noreferrer">Area Converter</a>
          </div>
        </div>
      </nav>
      <div className="header-right">
        <a href="https://arqonz.com/account/sign-in" className="login-btn" target="_blank" rel="noopener noreferrer">Login</a>
        <a href="https://arqonz.com/account/register" className="signup-btn" target="_blank" rel="noopener noreferrer">Sign Up</a>
      </div>
    </header>
  );
}

export default Header; 