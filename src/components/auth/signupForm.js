"use strict";

import React from 'react';
import Input from '../common/textInput';

var signupForm = React.createClass({

  render: function() {
    return (
      <form>
        <h1>User Signup</h1>
        <Input
          name="name"
          label="name"
          onChange={this.props.onChange}
          value={this.props.user.name} 
          error={this.props.errors.name}/>

        <Input 
          name="phone"
          label="phone"
          onChange={this.props.onChange}
          value={this.props.user.phone} 
          error={this.props.errors.phone} />

        <Input 
          name="password"
          label="password"
          onChange={this.props.onChange}
          value={this.props.user.password} 
          error={this.props.errors.password} />

        <input type="submit" value="Save" className="btn btn-default" onClick={this.props.onSave} />
      </form>
    );
  }
});

module.exports = signupForm;