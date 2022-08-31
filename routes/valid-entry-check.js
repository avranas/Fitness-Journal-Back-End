const express = require('express');
const JournalEntry = require('../db/models/JournalEntries');
const Profile = require('../db/models/Profiles');
const createHttpError = require("http-errors");

//YYYY-MM-DD format
//Returns an false if the check fails. Returns true if it passes
const validDateCheck = (next, date) =>{
   try{
      const todaysDate = new Date();
      //Make sure the entered date is valid
      if(date == "Invalid Date"){
         throw createHttpError(400, "The entered date is invalid");
      }
      //If entered date is out of range (before start date, after current date) return an error
      if(date > todaysDate){
         throw createHttpError(400, "The entered date is in the future");
      }
      return true;
   }catch (err){
      next(err);
      return false;
   }
}

//Returns true if entry exists, false if it does not
const entryExists = async (userId, entryDate) =>{
   //Check if an entry for this date has already been made by this user
   const existingEntryCheck = await JournalEntry.findAll({
      where: {
         entry_date: entryDate,
         user_id: userId
      }
   });
   if(existingEntryCheck[0]){
      return true;
   } else {
      return false;
   }
}

module.exports = {validDateCheck, entryExists};