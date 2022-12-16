//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
const app = express();

mongoose.set('strictQuery', true);
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))



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
}
    mongoose.connect(uri, options, (err, db) => {
      if (err) console.error(err);
      else console.log("Connected")
    })

    const userSchema = new mongoose.Schema({
      email: String,
      password: String
    });

    const secret = "Thisisanewgoodnicesecret";
      userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password", "email"] });
      // Always put the plugin above the collection which is User.
    const User = mongoose.model("User", userSchema)



app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/", function(req, res) {
  res.render("home");
});
app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    }else {
      res.render("secrets")
    };
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser.password === password){
        res.render("secrets")
      }
    }
  });

});

  app.listen(3000, function() {
  console.log("Starting on port 3000")
});
