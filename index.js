const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const Key = require('./models/Key');
const Game = require('./models/Game');
const Utils = require('./utils');
require('dotenv').config();
const marked = require('marked');
const app = express();
const port = 3000;
const fs = require('fs');

const session = require("express-session");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(session({ secret: process.env.secret }));
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

app.get('/', (req, res, next) => {
    fs.readFile('./md/documentation.md', (err, data)=>{
        if(err) throw err;
        const str = data.toString('utf-8');
        res.status(200).send(marked(str));
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

/**
 * The endpoint for registration,
 * Returns a JSON with the following information
 * success - if the registration is successful
 * message - error message (only sent on error)
 * user - the sanitized user object after registration (only sent on successful registration)
 */
app.post('/api/register', (req, res, next) =>{
    // Check if username field is undefined or null
    if(req.body.username === undefined || req.body.username === null)
        return res.status(200).send({
            success: false,
            message: "Username field is empty!"
        });
    // Check if password field is undefined or null
    if(req.body.password === undefined)
        return res.status(200).send({
            success: false,
            message: "Password field is empty!"
        });
    // Check if email is undefined or null
    if(req.body.email === undefined)
        return res.status(200).send({
            success: false,
            message: "Email field is empty!"
        });
    // Find a user with the entered username
    User.findOne({username: req.body.username}, (err, userName)=>{
        // If internal error, return default message and log error to console
        if(err) {
            console.log(err);
            return res.status(200).send({
                success: false,
                message: "Internal error!"
            });
        }
        // If a user with that name does not exist, continue
        if (!userName) {
            // See if any users exist with that email
            User.findOne({email: req.body.email}, (err, userEmail)=>{
                // If internal error, return default message and log error to console
                if (err) {
                    console.log(err);
                    return res.status(200).send({
                        success: false,
                        message: "Internal error!"
                    });
                }
                // If no user with that email exists, proceed to create new user
                if (!userEmail) {
                    // Create new user with entered fields
                    const newUser = new User({
                        username: req.body.username,
                        password: Utils.hash(req.body.password),
                        email: req.body.email,
                        friends: [],
                        requests: []
                    });
                    // Save the user to the database
                    newUser.save((err, _res) => {
                        // If error, return default error message and log full error to console
                        if (err) {
                            console.log(err);
                            return res.status(200).send({
                                success: false,
                                message: "Internal error!"
                            });
                        }
                        // If everything is successful, return the user object with all sensitive data stripped
                        return res.status(200).send({
                            success: true,
                            user: Utils.sanitize(user)
                        });
                    });
                // Else a user with this email exists, send generic message
                } else {
                    return res.status(200).send({
                        success: false,
                        message: "Sign up error: Username or email already exists!"
                    });
                }
            });
        // Else a user with this name already exists
        } else {
            return res.status(200).send({
                success: false,
                message: "Sign up error: Username or email already exists!"
            });
        }
    });
});

/**
 * Get coin key endpoint
 * For game, key can be cashed in one minute later to receive coin prize
 * Required fields:
 * game - the game object id the key is being called for
 *
 * Returned fields:
 * key - The key object (will return false on error)
 * message - Ihe status of the request
 */
app.post('/api/get-key', (req, res, next)=> {
    // Key should only be retrieved if the user is authenticated
    if(req.isAuthenticated()) {
        // Check to make sure that game field is not null or undefined
        if(req.body.game !== undefined && req.body.game !== null) {
            // Get the user object
            const user = req.user;
            // Find a key owned by the user
            Key.findOne({user: user._id}, (err, key) => {
                // If error, return default error message and log actual error to console
                if (err) {
                    console.log(err);
                    return res.status(200).send({
                        key: false,
                        message: "Internal error"
                    });
                }
                // If the key already exists, delete it
                if (key) {
                    key.delete();
                }
                // create a new key for the game
                const newKey = new Key({
                    user: user._id,
                    game: req.body.game
                });
                // Set the last time a key has been requested to now
                user.lastKey = Date.now();
                // Update the user
                user.update();
                // Send the key to the endpoint with success message
                return res.status(200).send({
                    key: newKey,
                    message: "Success!"
                });
            });
        // If game field is left empty (by field I mean the post variables)
        } else {
            return res.status(200).send({
                key: false,
                message: "No game specified!"
            });
        }
    // If not logged in, send message
    } else {
        return res.status(200).send({
            key: false,
            message: "You must be logged in to do that!"
        });
    }
});

/**
 * Use Key Endpoint
 * This endpoint is used to cash
 * in the keys obtained from the
 * Get Key endpoint for coins
 *
 */
app.post('/api/use-key', (req, res, next)=> {
    // Check first to make sure user is authenticated
    if(!req.isAuthenticated()) return res.status(200).send({
        success: false,
        newCoins: -1,
        message: "You must be logged in to do that!"
    });

    // Make sure the key field is not undefined or null
    if(req.body.key !== undefined && req.body.key !== null) {
        // Obtain the user object
        const user = req.user;
        // Make sure that the key exists FOR THAT USER
        Key.findOne({key: req.body.key, user: user._id}, (err, key)=> {
            // If error, return default error message and log error to console
            if(err) {
                console.log(err);
                return res.status(200).send({
                    success: false,
                    newCoins: user.coins,
                    message: "Internal error"
                });
            }

            // If the key does not exist, return error message
            if(!key) {
                return res.status(200).send({
                    success: false,
                    newCoins: user.coins,
                    message: "Invalid key or user!"
                })
            }

            // Now we must find the corresponding game
            Game.findById(key.game, (err, game)=> {
                // If error on finding game, return default error message and log error to console
                if(err) {
                    console.log(err);
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: "Internal error!"
                    });
                }
                // If the game does not exist, return false and game not found error
                if(!game) {
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: "There is no such game!"
                    });
                }
                // If the game key was requested less than 60 seconds ago
                if(Date.now() - user.lastKey < 60000) {
                    return res.status(200).send({
                        success: false,
                        newCoins: user.coins,
                        message: "Used key too soon!"
                    });
                }
                // Add the games coin reward to the user object
                user.coins += game.reward;
                // Update the user
                user.update();
                // Return the new number of coins
                return res.status(200).send({
                    success: true,
                    newCoins: user.coins,
                    message: "Coins added!"
                });
            });
        })
    }
});


app.post('/api/update-email', isAuthenticated, (req, res, next)=> {
    const user = req.user;
    if (req.body.email !== undefined && req.body.email !== null) {
        const email = req.body.email;
        if (email !== user.email) {
            user.email = email;
            user.update((err)=> {
                if (err) {
                    req.status(200).send({
                        success: false,
                        message: 'Internal error!'
                    });
                } else {
                    req.status(200).send({
                        success: true,
                        message: 'Email updated!'
                    });
                }
            });
        } else {
            // email parameter is same as last email
            req.status(200).send({
                success: false,
                message: 'You cannot update your email to the previous email!'
            });
        }
    } else {
        // parameter `email` is empty or null
        req.status(200).send({
            success: false,
            message: 'Email parameter is empty or null!'
        });
    }
});

app.post('/api/update-password', isAuthenticated, (req, res, next)=> {
    const user = req.user;
    if (req.body.password !== undefined && req.body.password !== null && req.body.password !== '') {
        if (req.body.oldPassword !== undefined && req.body.oldPassword !== null && req.body.oldPassword !== '') {
            // Make sure old password doesn't equal the old password (case-insensitive)
            if (req.body.password.toLowerCase() !== req.body.oldPassword.toLowerCase()) {

            } else {
                // Old password and new password are too similar
            }
        } else {
            // Old password parameter is empty
        }
    } else {
        // New password parameter is empty
    }
});

/**
 * User data endpoint
 *
 * Prerequisites
 * - user must be logged in
 *
 * Returns
 * - The sanitized user object
 * - Error message if applicable
 */
app.get('/api/users/:username', isAuthenticated, (req, res, next)=> {
    // Find the user in the database
    const user = User.findOne({username: req.params[0]}, (err, user)=> {
        // If error, return default error message and log actual error to console
        if (err) {
            console.log(err);
            return req.json({error: "Internal error!"});
        }
        // If the user does not exist, return a user not found error
        if (!user) return req.json({error: `User ${req.params[0]} not found!`});
        // Otherwise, send the sanitized user object
        return res.status(200).send(Utils.sanitize(user));
    });
});

app.listen(port, () => {
  console.log(`BlendyAPI listening on port ${port}!`);
});