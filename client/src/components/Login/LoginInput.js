import React from 'react'

export default function LoginForm(props) {
  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body">
        <div className="container"style={{alignSelf: 'start'}}>
          <h1 className="title">
            Judge Login
              </h1>
          <form id="login-form" onSubmit={props.handleSubmit}>
            <div className="field">
              <p className="control has-icons-left">
                <input className="input is-medium" placeholder="Username" onChange={props.handleUsernameChange}></input>
                <span className="icon is-small is-left">
                  <i className="fas fa-user" />
                </span>
              </p>
            </div>

            <div className="field">
              <p className="control has-icons-left">
                <input type="password" className="input is-medium" placeholder="Password" onChange={props.handlePasswordChange}></input>
                <span className="icon is-small is-left">
                  <i className="fas fa-lock" />
                </span>
              </p>
            </div>

            <div className="control">
              <button type="submit" form="login-form" className="button is-primary is-medium is-fullwidth">Login</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}