const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const app = express();
const port = 3000;

const session = require("express-session");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  'mongodb://localhost:27017/BlendyAPI', {
    useNewUrlParser: true
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done){
        User.findOne({username: username}, function(err, user){
            if(err) return done(err);
            if(!user) {
                return done(null, false, {message: 'No user found!'});
            }
            if(!user.validPassword(password)){
                return done(null, false, {message: 'Invalid password!'});
            }
            return done(null, user);
        });
    }
));

app.get('/example', (req, res, next) => {
  return req.status(200).send({
    test: true
  });
});

function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.json({message: 'Authentication failure! Please log in.'});
    }
}

/*

app.post('/api/login', passport.authenticate('local', function(req, res){
    res.redirect('/api/users/' + req.user.username);
}));
*/

/**
 * Modified from http://www.passportjs.org/docs/authenticate/
 * Under "Custom Callback"
 */
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log('passport.authenticate error: ', err);
      return res.status(200).send({ 
        success: false, 
        message: 'Internal Error' 
      });
    }

    if (!user) {
      console.log('no user error');
      return res.status(200).send({ 
        success: false, 
        message: 'Internal Error' 
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.log('login user error: ', err);
        return res.status(200).send({ 
          success: false, 
          message: 'Internal Error' 
        });
      }

      return res.status(200).send(user);
    });

  })(req, res, next);
});

app.get('/api/users/:username', isAuthenticated, (req, res, next)=>{
    var user = User.findOne({username: req.params[0]}, (err, user)=>{
        if(err) return req.json({error: err});
        if(!user) return req.json({error: `User ${req.params[0]} not found!`});
        return req.json({
            username: user.username,
            joined: user.joined,
            rank: user.rank,
            friends: user.friends,
            requests: user.requests,
            coins: user.coins
        });
    });
});

app.listen(port, () => {
  console.log(`BlendyAPI listening on port ${port}!`);
});