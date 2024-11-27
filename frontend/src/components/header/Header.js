// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header>
            <nav>
                <ul>
                    <li><Link to="/by-cpv-designation">By CPV Designation</Link></li>
                    <li><Link to="/by-company">By Company</Link></li>
                    <li><Link to="/by-public-entity">By Public Entity</Link></li>
                    <li><Link to="/by-distribution-contracts">By Distribution of Contracts</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;