import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import Logo from '../../trivia.png';

export default function Navigation() {
    return (
        <header className="navBar-header">
            <div className="navBar-items">
                <NavLink to='/'><img className='logo' src={Logo} alt='logo'/></NavLink>
            </div>
        </header>
    );
};