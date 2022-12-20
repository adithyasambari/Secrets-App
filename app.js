//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const md5 = require('md5');
// const encrypt = require("mongoose-encryption")

const app = express();

mongoose.set('strictQuery', true);
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// This should be just above the mongooseconnect consts
//   and just below the bodyparser app.use
app.use(session({
  secret: "My secrets app.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const uri = 'mongodb://localhost:27017/userDB';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};
    mongoose.connect(uri, options, (err, db) => {
      if (err) console.error(err);
      else console.log("Connected")
    });


    const userSchema = new mongoose.Schema({
      email: String,
      password: String
    });

    userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
        // Serialise means to create cookie and deserialize means to use the cookie to
        // authenticate the details
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

      // userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
      // Always put the plugin above the collection which is User.



app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  }else {
    res.redirect("/login")
  }
})

app.get("/logout", function (req, res) {
  // req.logout comes from the docs of passportjs
  req.logout(function(err) {
    if(err){
      console.log(err);
  } else{
    res.redirect('/');
  };
})
})


app.post("/register", function (req, res) {

  User.register({username: req.body.username},req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    }else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //
  //     const newUser = new User({
  //       email: req.body.username,
  //       password: hash
  //     });
  //
  //     newUser.save(function (err) {
  //       if (err) {
  //         console.log(err);
  //       }else {
          // res.render("secrets")
  //       };
  //     });
  //   });

});

app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
// req.login comes from the docs of passportjs
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    }else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })


  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({email: username}, function(err, foundUser){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     // if(foundUser.password === password){
  //     //   res.render("secrets")
  //     // }
  //     if(foundUser){
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         if (result === true) {
            // res.render("secrets")
  //         }
  //       });
  //
  //     }
  //
  //   }
  // });

});

  app.listen(3000, function() {
  console.log("Starting on port 3000")
});
