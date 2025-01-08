// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';


const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/home">
            <span className="material-icons">home</span> 
          </Link>
        </li>
        <li>
          <Link to="/tables">
            <span className="material-icons">table_restaurant</span> 
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <span className="material-icons">person</span> 
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
