import React from 'react'
import {Link} from 'react-router-dom'

import './navbar.css'

const Navbar = () => {
    return (
        <nav className="main-nav">
            <div className="container">
                <div className="logo">
                    <div>
                        <Link to={`/`}>Draw Recorder</Link>
                    </div>
                </div>
                <ul>
                    <li><Link to={`/`}>View Notes</Link></li>
                    <li><Link to={`/notes/record`}>Record Note</Link></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar;