var User = require('./user');
var express = require('express');
var jwt = require('jwt-simple');
var _ = require('lodash');
var app = express();
var bcrypt = require('bcrypt');
app.use(require('body-parser').json());

var users =[{username: 'taylorxxx', password: '$2a$10$QLFArq887wW2Rn76ot7qw.ucKdsfXAc49q34o9k/bCt.eljyuxaBC'}];
var secretKey = 'supersecretkey';

function findUserByUsername(username){
  return _.find(users, {username: username});
}

function validateUser(user, password, callback){
  return bcrypt.compare(password, user.password, callback);
}

// to request token
app.post('/session', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, user){
    if(err){
      return next(err);
    }
    if(!user){
      res.send(401);
    }
    bcrypt.compare(req.body.password, user.password, function(err, valid){
      if(err){
        return next(err);
      }
      if(!user){
        res.send(401);
      }
      var token = jwt.encode({username: user.username}, secretKey);
      res.json(token);
    });
  });
});

// to create user
app.post('/user', function(req, res, next){
  var user = new User({username: req.body.username});
  bcrypt.hash(req.body.password, 10, function(err, hash){
    user.password = hash;
    user.save(function(err, user){
      if(err) {
        throw next(err);
      }
      res.send(201);
    });
  });
});

app.get('/user', function(req, res){
  var token = req.headers['x-auth'];
  var auth = jwt.decode(token, secretKey);
  User.findOne({username: auth.username}, function(err, user){
    res.json(user);
  });
});

app.listen(3000);
