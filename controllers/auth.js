'use strict'
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/testCarpool');
var co = require('co');
var bcrypt = require('co-bcrypt');
var jwt = require('jsonwebtoken');
var phone = require('phone');

var sms = require('../modules/sms');
var users = wrap(db.get('users'));

co(function * () {
  var users = yield users.find({});
});

function generateCode() {
  return Math.floor(Math.random() * (999999 - 111111)) + 111111;
}

function *signup(next) {
  var userData = this.request.body;
  console.log(this.request.body);
  var user = yield users.find({phone: userData.phone});
  console.log('user',user)
  if(user.length === 1) {
    if(bcrypt.compare(userData.password, user.hash)) {
      console.log('tried creating user but already user', user)
      this.body = {message: 'Bro, you already signed up with that username and password'}
    } else {
      this.body = {message: 'username exists!'};
    }
  } else {
    //create user
    var salt = yield bcrypt.genSalt(10)
    var hash = yield bcrypt.hash(userData.password, salt)
    var token = jwt.sign({ foo: user.name }, process.env.JWTSECRET);
    users.updateById(user.id, this.user, function(err, user) {
      if (err) {
        this.body = {message: 'error updating jwt'};
      }
    })   
    var code = generateCode();
    yield users.insert({ 
      confirmationCode: code,
      numberConfirmed: false,
      hash: hash, 
      jwt: token, 
      phone: userData.phone,
      name: userData.name
    });
    // sms.sendMessage(userData.phone, 'carpoolio code: ' + code)
    console.log('user after insert');
    this.body = yield users.findOne({phone: userData.phone});
  }
}

function *checkToken(next) {
  console.log('this', this)
  var providedToken = this.header.authorization;
  var user = yield users.findOne({jwt: providedToken})
  if (user) {
    this.state.user = user;
    this.body = {user: user.name}
    this.status = 200;
  } else {
    this.status = 403;
    this.body = {message: 'failed token auth'};
  }
}

function *confirmUser(next) {
  var providedToken = this.header.authorization;
  var user = yield users.findOne({jwt: providedToken})
  var data = this.request.body;
  if (user) {
    this.state.user = user;
    user.confirmed = true;
    yield user.update({confirmationCode: data.code}, {confirmed: true});
    this.body = {message: "confirmed"}
  }
}

function *isAuth(next) {
  console.log('this', this)
  var providedToken = this.header.authorization;
  var user = yield users.findOne({jwt: providedToken})
  if (user) {
    this.state.user = user;
    yield next;
  } else {
    this.status = 403;
    this.body = {message: 'failed token auth'};
  }
}

function *login(next) {
  var userData = this.request.body;
  console.log('user data in login', userData);
  console.log('the login request', this.request)
  // console.log('logging body in login', this);
  var user = yield users.findOne({phone: userData.phone})
  if(user && bcrypt.compare(userData.password, user.hash)) {
    user.jwt = jwt.sign({ user: user.name }, process.env.JWTSECRET);
    yield users.updateById(user._id, user)
    this.user = user;
    this.body = user;
  } else {
    this.body = {message: 'invalid username or password'};
    this.status = 403;
  }
}

function *logout(next) {
  this.user.jwt = null; 
  users.updateById(user.id, this.user, function(err, doc){
    if (err) {
      this.body = {message: 'error logging out'}
    } else {
      this.body = {message: 'logout successfull'}
    }
  })
}

module.exports = {
  login: login,
  signup: signup,
  logout: logout,
  checkToken: checkToken,
  isAuth: isAuth
}

