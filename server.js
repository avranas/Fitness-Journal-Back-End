require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express(); 
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
//const initalizePassport = require('./passport-config');

//This makes req.body.username work
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}));
app.use( express.static( "public" ) );
//initalizePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

//Routes
app.get('/', (req, res, next) => {
   console.log('Hello world');
   res.status(200).send('Hello world');
});



app.listen(PORT, () => {
   console.log(
      `Running Photo Caption Contest - Listening on port ${PORT}`
   );
});
