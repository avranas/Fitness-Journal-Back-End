const express = require('express');
const JournalEntry = require('../db/models/JournalEntries');
const {checkAuthenticated} = require('./authentication-check');
const { Op } = require('sequelize');
const {validDateCheck, entryExists} = require('./valid-entry-check');
const { getJournalEntries } = require('./get-journal-entries');
const createHttpError = require("http-errors");

/*
TODO: MAKE THESE ROUTES
GET /weight_pace/:start_date/:target_date	//Returns your estimated weight at a future date at your current pace
GET /journal_entry/max_chain  //Easy - returns the user’s max chain. This gets recalculated whenever entries are posted, modified, or removed

I can skip weight pace if I want. Max chain should be easy
Next: write your own tests and test everything
*/


//All of these routes can only be used when a user is authenticated
const journalEntryRouter = express.Router();
journalEntryRouter.use(checkAuthenticated);

//Get all journal entries for a user
journalEntryRouter.get('/', async (req, res) => {
   try{
      const result = await JournalEntry.findAll({
         where: { user_id: req.user.id }
      });
      res.status(200).send(result);
   }catch(err){
      next(err);
   }
});

//Get one journal entry by its date
journalEntryRouter.get('/:entry_date', async (req, res, next) => {
   try{
      let entryDate = new Date(req.params.entry_date);
      if(!validDateCheck(next, entryDate)){
         throw "Not a valid date";
      }
      const result = await JournalEntry.findAll({
         where: { entry_date: req.params.entry_date }
      });
      if(result[0]){
         res.status(200).send(result);
      } else {
         throw createHttpError(404, "No entry for this date was found");
      }
   }catch(err){
      next(err);
   }
});

//Get all journal entries for a user in a range of dates
journalEntryRouter.get('/:start_date/:end_date', async (req, res, next) => {
   try{
   //Get all journal entries for a user in a range of dates
      let startDate = new Date(req.params.start_date);
      let endDate = new Date(req.params.end_date);
      if(startDate > endDate){
         const temp = startDate;
         startDate = endDate;
         endDate = temp;
      }
      const result = await getJournalEntries(req, res, next, startDate, endDate);
      res.status(200).send(result);
   }catch(err){
      next(err);
   }
});

//Post a new journal entry
/*
Example:
localhost:3000/journal-entries/2022-08-06
   {
      "weight": 198.6,
      "exercise_goal_met": true,
      "caloric_intake": 2000,
      "protein_intake": 150,
      "notes": "Had Chipotle 2x chicken + guac and a protein shake."
   }
   //All entries are required except for notes
*/
journalEntryRouter.post('/:entry_date', async (req, res, next) => {
   try{
      const entryDate = new Date(req.params.entry_date)
      if(!validDateCheck(next, entryDate)){
         throw "Not a valid date";
      }
      if(await entryExists(req.user.id, entryDate)){
         throw createHttpError(400, "An entry for this date already exists");
      }
      //Check to make sure there's data for every part of the journal entry
      if(req.body.weight === undefined){
         throw createHttpError(400, 'Put in a value for "weight"');
      }
      if(req.body.exercise_goal_met === undefined){
         throw createHttpError(400, 'Put in a value for "exercise_goal_met"');
      }
      if(req.body.caloric_intake === undefined){
         throw createHttpError(400, 'Put in a value for "caloric_intake"');
      }
      if(req.body.protein_intake === undefined){
         throw createHttpError(400, 'Put in a value for "protein_intake"');
      }

      //Check to make sure they're all the correct type
      console.log(typeof req.body.weight != Number)
      console.log(typeof req.body.weight)
      console.log(Number);
      if(typeof req.body.weight != 'number'){
         throw createHttpError(400, '"weight" must be a number');
      }
      if(typeof req.body.exercise_goal_met != 'boolean'){
         throw createHttpError(400, '"exercise_goal_met" must be a boolean');
      }
      if(typeof req.body.caloric_intake != 'number'){
         throw createHttpError(400, '"caloric_intake" must be a number');
      }
      if(typeof req.body.protein_intake != 'number'){
         throw createHttpError(400, '"protein_intake" must be a number');
      }
      await JournalEntry.create({
         entry_date: entryDate,
         weight: req.body.weight,
         exercise_goal_met: req.body.exercise_goal_met,
         caloric_intake: req.body.caloric_intake,
         protein_intake: req.body.protein_intake,
         notes: req.body.notes,
         user_id: req.user.id
      });
      res.status(201).send('New entry accepted');
   }catch(err){
      next(err);
   }
});

/*
localhost:3000/journal-entries/2022-08-06
   JSON Body example:
   {
      "weight": 198.6,
      "exercise_goal_met": true,
      "caloric_intake": 3000,
      "protein_intake": 250,
      "notes": "I AM FAT AF"
   }
   Not every option requires data. You can only update one option if you'd like!
*/
journalEntryRouter.put('/:entry_date', async (req, res, next) => {
   try {
      const entryDate = new Date(req.params.entry_date);
      if(!validDateCheck(next, entryDate)){
         throw "Failed validDateCheck";
      }
      //Make sure an entry already exists
      if(! await entryExists(req.user.id, entryDate)){
         throw createHttpError(400, "An entry for this date does not exist");
      } else {
         await JournalEntry.update({
            weight: req.body.weight,
            exercise_goal_met: req.body.exercise_goal_met,
            caloric_intake: req.body.caloric_intake,
            protein_intake: req.body.protein_intake,
            notes: req.body.notes
         },{
            where: {
            entry_date: entryDate,
            user_id: req.user.id
         }});
      res.status(200).send(`Updated journal entry for user: ${req.user.username}, at date: ${entryDate}.`);
      }
   } catch (err) {
      next(err);
   }
});

journalEntryRouter.delete('/:entry_date', async (req, res, next) => {
   try{
      const entryDate = new Date(req.params.entry_date);
      if(!validDateCheck(next, entryDate)){
         throw "Failed validDateCheck";
      }
      //Make sure an entry already exists
      if(! await entryExists(req.user.id, entryDate)){
         throw createHttpError(400, "An entry for this date does not exist");
      } else {
         const results = await JournalEntry.destroy({
            where: {
               entry_date: entryDate,
               user_id: req.user.id
            }
         });
         res.status(200).send(`Deleted journal entry for user: ${req.user.username}, at date: ${entryDate}.`);
      }
   } catch(err){
      next(err);
   }
});

module.exports = journalEntryRouter;