const LocalStrategy = require('passport-local').Strategy;
const User = require('./db/models/Users.js')
const bcrypt = require('bcrypt');

function initialize(passport) {
   const getUserByUsername = async (username) => {
      try {
         const result = await User.findOne({
            where: { username: username}
         });
         return result.toJSON();
      } catch (err)  {
         console.log(err);
         return null;
      }
   }
   const getUserById = async (id) => {
      //Get a User with id and return it
      try {
         const result = await User.findOne({
            where: { id: id}
         });      
         return result.toJSON();
      } catch (err) {
         console.log(err);
         return null;
      }
   }
   const authenticateUser = async (username, password, done) => {
      const user = await getUserByUsername(username)
      if(user == null){
         return done(null, false);
      }
      try{
         if(await bcrypt.compare(password, user.password)) {
            return done(null, user);
         }else{
            return done(null, false);
      }
      }catch(err) {
         return done(err);
      }
   }

   passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser))
   passport.serializeUser((user, done) => done(null, user.id))
   passport.deserializeUser(async (id, done) => {
   return done(null, await getUserById(id));
   });
}

module.exports = initialize;