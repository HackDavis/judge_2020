import React, {useState} from 'react';
import logo from '../../../assets/images/logo.png';

export default function Navbar(props) {
  const [expandNav, setExpandNav] = useState(false);

  return (
    <React.Fragment>
      <section className="navbar is-white has-shadow">
        <div className="navbar-brand">
          <div className="navbar-item">
            <h1 className="title">
              <img src={logo} alt="HackDavis" />
            </h1>
          </div>
          <a href role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="nav-drop" onClick={() => setExpandNav(!expandNav)}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div id="nav-drop" className={'navbar-menu' + (expandNav ? ' is-active' : '') }>
          <div className="navbar-end">
            { props.includeLogout === true &&
              <div className="navbar-item">
                <a href className="button" onClick={props.handleLogout}>
                Logout
                </a>
              </div>
            }
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};