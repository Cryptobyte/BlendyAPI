const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const Key = require('./models/Key');
const Game = require('./models/Game');
const Utils = require('./utils');
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
  return res.status(200).send({
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
      res.status(200).send(Utils.sanitize(user));
    });

  })(req, res, next);
});

app.post('/api/register', (req, res, next) =>{
    var user = new User({
        username: req.body.username,
        password: Utils.hash(req.body.password),
        email: req.body.email,
        friends: [],
        requests: []
    });

    user.save((err)=>{
        if(err){
            return res.status(200).send({
                success: false,
                message: 'Registration failure: internal error!'
            });
        }
        return res.status(200).send({
            success: true,
            user: Utils.sanitize(user)
        });
    });
});


app.post('/api/get-key', (req, res, next)=>{
    if(req.isAuthenticated()){
        if(req.body.game !== undefined) {
            var user = req.user;
            Key.findOne({user: user._id}, (err, key) => {
                if (err) {
                    return res.status(200).send({
                        key: false,
                        message: err
                    });
                }
                if (key) {
                    key.delete();
                }
                // create a new key for the game
                var newKey = new Key({
                    user: user._id,
                    game: req.body.game
                });
                user.lastKey = Date.now();
                user.update();
                return res.status(200).send({
                    key: newKey,
                    message: "Success!"
                });
            });
        } else{
            return res.status(200).send({
                key: false,
                message: "No game specified!"
            });
        }
    }else{
        return res.status(200).send({
            key: false,
            message: "You must be logged in to do that!"
        });
    }
});

app.post('/api/use-key', (req, res, next)=>{
    if(!req.isAuthenticated()) return res.status(200).send({
        success: false,
        newCoins: -1,
        message: "You must be logged in to do that!"
    });

    if(req.body.key !== undefined){
        var user = req.user;
        Key.findOne({key: req.body.key, user: user._id}, (err, key)=>{
            if(err){
                return res.status(200).send({
                    success: false,
                    newCoins: user.coins,
                    message: err
                });
            }

            if(!key){
                return res.status(200).send({
                    success: false,
                    newCoins: user.coins,
                    message: "Invalid key or user!"
                })
            }

            // Now we must find the corresponding game
            Game.findById(key.game, (err, game)=>{
                if(err){
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: err
                    });
                }
                if(!game){
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: "There is no such game!"
                    });
                }

                if(Date.now() - user.lastKey < 60000){
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: "Used key too soon!"
                    });
                }

                user.coins += game.reward;
                user.save();

                return res.status(200).send({
                    success: true,
                    newCoins: user.coins,
                    message: "Coins added!"
                });
            });
        })
    }
});

app.get('/api/users/:username', isAuthenticated, (req, res, next)=>{
    var user = User.findOne({username: req.params[0]}, (err, user)=>{
        if(err) return req.json({error: err});
        if(!user) return req.json({error: `User ${req.params[0]} not found!`});
        return res.status(200).send(Utils.sanitize(user));
    });
});

app.listen(port, () => {
  console.log(`BlendyAPI listening on port ${port}!`);
});