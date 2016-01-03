"use strict"

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var AuthStore = require('../../stores/authStore');
var AuthActions = require('../../actions/AuthActions');

var Header = React.createClass({
  getInitialState: function() {
    return {
      user: AuthStore.getLoggedInUser()
    }
  },
  componentWillMount: function() {
    AuthStore.addChangeListener(this.updateUser);
  },
  componentWillUnmount: function() {
    AuthStore.removeChangeListener(this.updateUser);
  },
  updateUser: function() {
    this.setState({user: AuthStore.getLoggedInUser()});
  },
  logout: function() {
    AuthActions.logout();
  },
  render: function() {
    var loginState; 
    console.log('state',this.state.user)
    if (typeof this.state.user === "string") {
      loginState = (
        <div>
          <li>Logged in as {this.state.user}</li>
          <li><Link onClick={this.logout} to="login">logout</Link></li>
        </div>      
        )
    } else {
      loginState = ( 
        <div>
          <li><Link to="signup">sign up</Link></li>
          <li><Link to="login">login</Link></li>
        </div>
        )
    }
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <a href="/" className="navbar-brand">
          LOGO</a>
        <ul className="nav navbar-nav">
          {loginState}
        </ul>
      </div>
    </nav>
    );
  }
});

module.exports = Header;