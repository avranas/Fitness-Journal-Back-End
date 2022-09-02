const express = require('express');
const JournalEntry = require('../db/models/JournalEntries');
const Profile = require('../db/models/Profiles');
const {checkAuthenticated} = require('./authentication-check');
const {validDateCheck, userProfile} = require('./valid-entry-check');
const { getJournalEntries, getAllJournalEntries } = require('./get-journal-entries');
const createHttpError = require("http-errors");

/*

  Summary returns the following:
    a: average/min/max daily caloric intake
    b: average/min/max daily protein intake
    c: average daily weight change, biggest gain, biggest loss
    d: % of days you have stuck with your goal
 */
const summaryRouter = express.Router();
summaryRouter.use(checkAuthenticated);


const calorieSummary = (journal) => {
   //Calculate min/max/avg caloric intake
   let avgCaloricIntake = 0;
   let maxCaloricIntake = 0;
   let minCaloricIntake = Infinity;
   for(let i = 0; i !== journal.length; i++){
      const caloricIntake = journal[i].caloric_intake
      avgCaloricIntake += caloricIntake;
      if(caloricIntake > maxCaloricIntake){
         maxCaloricIntake = caloricIntake;
      }
      if(caloricIntake < minCaloricIntake){
         minCaloricIntake = caloricIntake;
      }
   }
   avgCaloricIntake /= journal.length;
   return { avgCaloricIntake, maxCaloricIntake, minCaloricIntake };
}

const proteinSummary = (journal) => {
   let avgProteinIntake = 0;
   let maxProteinIntake = 0;
   let minProteinIntake = Infinity;
   for(let i = 0; i !== journal.length; i++){
      const proteinIntake = journal[i].protein_intake
      avgProteinIntake += proteinIntake;
      if(proteinIntake > maxProteinIntake){
         maxProteinIntake = proteinIntake;
      }
      if(proteinIntake < minProteinIntake){
         minProteinIntake = proteinIntake;
      }
   }
   avgProteinIntake /= journal.length;
   return { avgProteinIntake, maxProteinIntake, minProteinIntake };
}

//GET /journal_entry/weight_pace/:start_date is the only other route left
const weightChangeSummary = (journal) => {
   //average daily weight change, biggest gain, biggest loss
   let prevWeight = null;
   let startWeight = 0;
   let biggestGain = 0;
   let biggestLoss = 0;
   let daysSinceLastEntry = 0;
   let loopDate = new Date(journal[0].entry_date)
   const endDate = new Date(journal[journal.length - 1].entry_date);
   let totalDayCounter = 0;
   while(loopDate <= endDate){
      daysSinceLastEntry++;
      //If there is a journal entry with this date, pull its data
      const entry = journal.find(i => +new Date(i.entry_date) == +loopDate);
      //If a journal entry was found
      if(entry){
         const newWeight = entry.weight;
         //First entry
         if(prevWeight === null){
            prevWeight = newWeight;
            startWeight = newWeight;
         } else {
            const dailyWeightChange = (newWeight - prevWeight ) / daysSinceLastEntry;
            if(dailyWeightChange > 0){
               if(dailyWeightChange > biggestGain){
                  biggestGain = dailyWeightChange;
               }
            } else if(dailyWeightChange < 0){
               if(Math.abs(dailyWeightChange) > biggestLoss){
                  biggestLoss = Math.abs(dailyWeightChange);
               }
            }
            prevWeight = newWeight
         }
         daysSinceLastEntry = 0;
      }
      totalDayCounter++;
      const newDate = loopDate.setDate(loopDate.getDate() + 1);
      loop = new Date(newDate);
   }
   const avgDailyWeightChange = (startWeight - prevWeight) / (totalDayCounter - 1);
   return {
      avgDailyWeightChange,
      biggestGain,
      biggestLoss
   };
}

const goalSummary = (journal) => {
   let loopDate = new Date(journal[0].entry_date)
   const endDate = new Date(journal[journal.length - 1].entry_date);
   let chainCounter = 0;
   let maxChain = 0;
   while(loopDate <= endDate){
      //If there is a journal entry with this date, pull its data
      const entry = journal.find(i => +new Date(i.entry_date) == +loopDate);
      //If a journal entry was found
      if(entry){
         if(entry.exercise_goal_met){
            chainCounter++;
            if(chainCounter > maxChain){
               maxChain = chainCounter;
            }
         } else {
            chainCounter = 0;
         }
      } else {
         chainCounter = 0;
      }
      const newDate = loopDate.setDate(loopDate.getDate() + 1);
      loop = new Date(newDate);
   }
   //% of days you have stuck with your goal
   let goalAchievedCounter = 0;
   for(let i = 0; i != journal.length; i++){
      if(journal[i].exercise_goal_met){
         goalAchievedCounter++;
      }
   }
   const goalAchievedPercentage = (goalAchievedCounter / journal.length * 100).toString() + "%";
   return {
      maxChain,
      goalAchievedPercentage
   };
}

//set start date = to null if you want to get a summary from your start date
const getWholeSummary = async (req, res, next, startDate, endDate) => {
   try {
      //Get all entries from start date to now
      const journalResult = await getJournalEntries(req, res, next, startDate, endDate);
      if(!journalResult){
         throw "Failed to get journal entries";
      }
      //If no entries are found for the specified date range, a summary can not be created
      if(!journalResult[0]){
         throw createHttpError(400, "No entries found in the specified dates");
      }
      //Process data
      const { avgCaloricIntake, maxCaloricIntake, minCaloricIntake } = calorieSummary(journalResult);
      const { avgProteinIntake, maxProteinIntake, minProteinIntake } = proteinSummary(journalResult);
      const { avgDailyWeightChange, biggestGain, biggestLoss } = weightChangeSummary(journalResult);
      const { maxChain, goalAchievedPercentage } = goalSummary(journalResult);
      const totalSummary = {
         "start_date": journalResult[0].entry_date,
         "end_date": journalResult[journalResult.length - 1].entry_date,
         "average_caloric_intake": avgCaloricIntake,
         "max_caloric_intake": maxCaloricIntake,
         "min_caloric_intake": minCaloricIntake,
         "average_protein_intake": avgProteinIntake,
         "max_protein_intake": maxProteinIntake,
         "min_protein_intake": minProteinIntake,
         "average_daily_weight_change": avgDailyWeightChange,
         "biggest_gain": biggestGain,
         "biggest_loss": biggestLoss,
         "goal_achieved_percentage": goalAchievedPercentage,
         "max_chain": maxChain
      }
      return totalSummary;
   } catch (err) {
      next(err);
   }
}

//Get a whole summary from start to finish
summaryRouter.get('/', async (req, res, next) => {
   try{
      const summary = await getWholeSummary(req, res, next, new Date(0), new Date);
      if(summary){
         res.status(200).send(summary);
      } else {
         throw "Failed to get summary"
      }
   } catch(err) {
      next(err);
   }
});

//Get a whole summary from start_date to today
summaryRouter.get('/:start_date', async (req, res, next) => {
   try {
      const summary = await getWholeSummary(req, res, next, new Date(req.params.start_date), new Date);
      if(summary){
         res.status(200).send(summary);
      } else {
         throw "Failed to get summary"
      }
   } catch(err) {
      next(err);
   }  
});

//Get a whole summary from start_date to end_date
summaryRouter.get('/:start_date/:end_date', async (req, res, next) => {
   try {
      let startDate = new Date(req.params.start_date);
      let endDate = new Date(req.params.end_date);
      if(startDate > endDate){
         const temp = startDate;
         startDate = endDate;
         endDate = temp;
      }
      const summary = await getWholeSummary(req, res, next, startDate, endDate);
      if(summary){
         res.status(200).send(summary);
      } else {
         throw "Failed to get summary"
      }
   } catch(err) {
      next(err);
   }  
});

module.exports = summaryRouter;