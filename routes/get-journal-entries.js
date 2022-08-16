const express = require('express');
const JournalEntry = require('../db/models/JournalEntries');
const { Op } = require('sequelize');
const {validDateCheck} = require('./valid-entry-check');

const getAllJournalEntries = async(req, res, next) => {
   try {
      const result = await JournalEntry.findAll({
         where: {
            user_id: req.user.id
         }, order: [
            ['entry_date', 'ASC']
        ]
      });
      return result;
   } catch (err) {
      next(err);
   }
}

const getJournalEntries = async (req, res, next, startDate, endDate) => {
   try{
      if(!validDateCheck(next, startDate) || !validDateCheck(next, endDate)){
         throw "Failed validDateCheck";
      }
      const result = await JournalEntry.findAll({
         where: {
            user_id: req.user.id,
            entry_date: {[Op.between]: [startDate, endDate]}
         }, order: [
            ['entry_date', 'ASC']
        ]
      });
      return result;
   } catch(err){
      next(err);
   }
}

module.exports = { getJournalEntries, getAllJournalEntries };