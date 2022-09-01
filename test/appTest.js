/*
   Hi, this is Alex, the programmer. This was my first time writing a suite of tests,
   so things might be a little messy. Please be patient and I would love
   constructive criticism :)
*/
const expect = require('chai').expect;
const { res } = require('../server');
const request = require('supertest');
const app = request.agent('http://localhost:3000');

//This user already exists. Don't change this
const testUsername = "avranas69";
const testPassword = 'p@ssw0rd'

const testUserData = {
   username: testUsername,
   password: testPassword
}

function loginUser(userData) {
   return done => {
       app.post('/login')
          .send(userData)
         .end( err => {
            if (err) return done(err);
            return done();
         });
   };
};

function logoutUser() {
   return done => {
       app.get('/logout')
         .end( err => {
            if (err) return done(err);
            return done();
         });
   };
};

describe('/ routes', () => {
   describe('GET /', () => {
      it("Returns 'Hello world'", done => {
         app
           .get('/')
           .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
             expect(res.text).to.equal("Hello world");
             expect(res.statusCode).to.equal(200);
             if (err) return done(err);
             else return done();
           });
       });
   });
});

/*
   Remember: everytime you run this test, you must change the value of testUsername,
   because multiple users can not have the same username
   This is why it is currently set to be skipped
*/
describe('/register', () => {
   describe('POST /', () => {

      //Change this to something else and remove ".skip" from "it.skip" below to test a new user
      const registerUsername = 'testuser16';

      const testRegisterUserData = {
         username: registerUsername,
         password: testPassword,
         starting_weight: 198.6,
         goal_weight: 168.6
      }
      //Remove ".skip" here to test. But don't forget to put it back when you're done
      it.skip(`should respond with a 200 status code and 'Created new user: ${registerUsername}`, done => {
         app
            .post('/register').send(testRegisterUserData)
            .end((err, res) => {
               console.log(`res code: ${res.statusCode} text: ${res.text}`);
               expect(res.text).to.equal(`Created new user: ${registerUsername}`);
               expect(res.statusCode).to.equal(200);
               if (err) return done(err);
               else return done();
           });
       });
       it(`should respond with a 400 status code with 'A user with that name already exists'`, done => {
         app
            .post('/register').send(testUserData)
            .end((err, res) => {
               console.log(`res code: ${res.statusCode} text: ${res.text}`);
               expect(res.text).to.equal('A user with that name already exists');
               expect(res.statusCode).to.equal(400);
               if (err) return done(err);
               else return done();
            });
       });
   });
});

describe('/login', () => {
   describe('POST /', () => {
      it(`Should respond with a 200 status code and 'Successfully logged in as: ${testUsername}'`, done => {
         app
            .post('/login').send(testUserData)
            .end((err, res) => {
               console.log(`res code: ${res.statusCode} text: ${res.text}`);
               expect(res.statusCode).to.equal(200);
               expect(res.text).to.equal(`Successfully logged in as: ${testUsername}`);
               if (err) return done(err);
               else return done();
         });
      });
   });
   describe('POST /', () => {  
      before('loggingIn', logoutUser());
      it(`Should respond with a 401 status code and 'Unauthorized'`, done => {
         const data = {
            username: 'invalidUsername',
            password: 'invalidPassword'
         }
         app
            .post('/login').send(data)
            .end((err, res) => {
               console.log(`res code: ${res.statusCode} text: ${res.text}`);
               expect(res.statusCode).to.equal(401);
               expect(res.text).to.equal('Unauthorized');
               if (err) return done(err);
               else return done();
            });
      });
   });
   describe('POST / with user logged in', () => {     
      before('loggingIn', loginUser(testUserData));
      it(`Should respond with 401 and 'You need to be logged out to do that' if a user is already logged in`, done => {
      app.post('/login').send(testUserData)
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('You need to be logged out to do that');
            if (err) return done(err);
            else return done();
         });
      });
   });
});

describe('GET /logout', function(){
   before('loggingIn', loginUser(testUserData));
   it('Logs out user, returns 200 + "You have been logged out"', done => {
      app
       .get('/logout')
       .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.text).to.equal("You have been logged out");
            expect(res.statusCode).to.equal(200);
           if (err) return done(err);
           done();
       });
   });
   it('Attempts to log out while no user is logged in. Returns 401 + "You need to be logged in to do that"', done => {
      app
       .get('/logout')
       .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.text).to.equal("You need to be logged in to do that");
            expect(res.statusCode).to.equal(401);
            if (err) return done(err);
            done();
       });
   });
});

const fullSummaryObjectTest = (res) => {
   let summary = res.body;
   expect(summary).to.have.ownProperty('start_date');
   expect(summary).to.have.ownProperty('end_date');
   expect(summary).to.have.ownProperty('average_caloric_intake');
   expect(summary).to.have.ownProperty('max_caloric_intake');
   expect(summary).to.have.ownProperty('min_caloric_intake');
   expect(summary).to.have.ownProperty('average_protein_intake');
   expect(summary).to.have.ownProperty('max_protein_intake');
   expect(summary).to.have.ownProperty('min_protein_intake');
   expect(summary).to.have.ownProperty('average_daily_weight_change');
   expect(summary).to.have.ownProperty('biggest_gain');
   expect(summary).to.have.ownProperty('biggest_loss');
   expect(summary).to.have.ownProperty('goal_achieved_percentage');
   expect(summary).to.have.ownProperty('max_chain');
}

describe('GET /summary', function(){
   //log into testUsername's profile and get a summary of all journal entries
   before('loggingIn', loginUser(testUserData));

   //Happy paths
   it('returns 200 + a full summary object for each entry', done => {
      app
       .get('/summary')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullSummaryObjectTest(res);
           if (err) return done(err);
           done();
      });
   });
   it('returns 200 + "a full summary object from 06-04-2022 to today"', done => {
      app
       .get('/summary/06-04-2022')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullSummaryObjectTest(res);
           if (err) return done(err);
           done();
      });
   });
   it('returns 200 + a full summary object for each entry', done => {
      app
       .get('/summary/06-04-1971')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullSummaryObjectTest(res);
           if (err) return done(err);
           done();
      });
   });
   it('returns 200 + a full summary object for 06-04-2022 to 06-09-2022', done => {
      app
       .get('/summary/06-04-2022/06-09-2022')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullSummaryObjectTest(res);
           if (err) return done(err);
           done();
      });
   });

   //Sad paths
   it('Returns 400 + "No entries found in the specified dates', done => {
      app.
      get('/summary/08-25-2022') //This user should not have any journal entries from this date to the present
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("No entries found in the specified dates");
          if (err) return done(err);
          done();
      });
   });
   it('Returns 400 + "No entries found in the specified dates', done => {
      app.
      get('/summary/08-26-2022/08-28-2022') //This user should not have any journal entries for this date range
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("No entries found in the specified dates");
          if (err) return done(err);
          done();
      });
   });
   it('Returns 400 + "The entered date is invalid" when an invalid date is entered', done => {
      app.
      get('/summary/06-0d-2022')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is invalid");
          if (err) return done(err);
          done();
      });
   });
   it('Returns 400 + "The entered date is in the future" when an entered date is in the future', done => {
      app.
      get('/summary/12-31-9999')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is in the future");
          if (err) return done(err);
          done();
      });
   });
   it('Returns 400 + "The entered date is invalid" when an invalid date is entered', done => {
      app.
      get('/summary/06-02-2022/06-0d-2022')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is invalid");
          if (err) return done(err);
          done();
      });
   });
});

const fullJournalEntriesTest = (res) => {
   expect(res.body).to.be.an.instanceOf(Array);
   let entry = res.body[0]; //Grab and inspect the first journal entry
   expect(entry).to.have.ownProperty('id');
   expect(entry).to.have.ownProperty('entry_date');
   expect(entry).to.have.ownProperty('weight');
   expect(entry).to.have.ownProperty('exercise_goal_met');
   expect(entry).to.have.ownProperty('caloric_intake');
   expect(entry).to.have.ownProperty('protein_intake');
   expect(entry).to.have.ownProperty('notes');
   expect(entry).to.have.ownProperty('user_id');
   expect(entry).to.have.ownProperty('createdAt');
   expect(entry).to.have.ownProperty('updatedAt');
   expect(entry).to.have.ownProperty('userId');
}

describe('GET /journal-entries', function(){
   //log into testUsername's profile and the user's journal entries
   before('loggingIn', loginUser(testUserData));

   //Happy paths
   it('returns 200 + a full journal-entries array', done => {
      app
       .get('/journal-entries')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullJournalEntriesTest(res);
           if (err) return done(err);
           done();
      });
   });
   it('returns 200 + the journal entry for 06-03-2022"', done => {
      app
       .get('/journal-entries/06-03-2022')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullJournalEntriesTest(res);
           if (err) return done(err);
           done();
      });
   });
   it('returns 200 + a full journal-entries array for dates 06-04-2022 to 06-09-2022', done => {
      app
       .get('/journal-entries/06-04-2022/06-09-2022')
       .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(200);
         fullJournalEntriesTest(res);
           if (err) return done(err);
           done();
      });
   });

   //Sad paths
   it('Returns 404 + "No entry for this date was found" on dates without an entry', done => {
      app.
      get('/journal-entries/08-25-2022')  //User avranas69 does not have an entry for this date
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(404);
        expect(res.text).to.equal("No entry for this date was found");
          if (err) return done(err);
          done();
      });
   });
   it('Returns "The entered date is invalid" when an invalid date is entered', done => {
      app.
      get('/journal-entries/06-0d-2022')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is invalid");
          if (err) return done(err);
          done();
      });
   });
   it('Returns "The entered date is in the future" when an entered date is in the future', done => {
      app.
      get('/journal-entries/12-31-9999')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is in the future");
          if (err) return done(err);
          done();
      });
   });
   it('Returns "The entered date is invalid" when an invalid date is entered', done => {
      app.
      get('/journal-entries/06-02-2022/06-0d-2022')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is invalid");
          if (err) return done(err);
          done();
      });
   });
});

const newEntryData = {
   weight: 198.6,
   exercise_goal_met: true,
   caloric_intake: 2000,
   protein_intake: 150,
   notes: "Had Chipotle 2x chicken + guac and a protein shake."
}

const modifiedEntryData = {
   weight: 198.6,
   exercise_goal_met: true,
   caloric_intake: 1000,   //Difference can be found here
   protein_intake: 150,
   notes: "Had Chipotle 2x chicken + guac and a protein shake."
}
describe('POST new entry, PUT (modify) it, then DELETE it', function(){
   const testDate = '2022-08-27';
   describe('POST /journal-entries', function(){
      //log into testUsername's profile and the user's journal entries
      before('loggingIn', loginUser(testUserData));
 
      //Happy paths
      it('returns 201 + returns "New entry accepted"', done => {
         app
         .post(`/journal-entries/${testDate}`)
         .send(newEntryData)
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(201);
            expect(res.text).to.equal("New entry accepted");
            if (err) return done(err);
            done();
         });
      });
   });
   describe('PUT /journal-entries', function(){
      it(`PUT JournalEntry that was just added, returns 200 + returns "Updated journal entry for user: ${testUsername}, at date: ${new Date(testDate)}."`, done => {
         app
         .put(`/journal-entries/${testDate}`)
         .send(modifiedEntryData)
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.equal(`Updated journal entry for user: ${testUsername}, at date: ${new Date(testDate)}.`);
            if (err) return done(err);
            done();
         });
      });
   });

   describe('GET /journal-entries', function(){
      it(`GET JournalEntry for the date that was just added - returns 200 + the journal entry for ${testDate}"`, done => {
         app
         .get(`/journal-entries/${testDate}`)
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(200);
            fullJournalEntriesTest(res);
            if (err) return done(err);
            done();
         });
      });
   });
   describe('DELETE /journal-entries', function(){
      it(`DELETE JournalEntry that was just added, returns 200 + returns "Deleted journal entry for user: ${testUsername}, at date: ${new Date(testDate)}."`, done => {
         app
         .delete(`/journal-entries/${testDate}`)
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.equal(`Deleted journal entry for user: ${testUsername}, at date: ${new Date(testDate)}.`);
            if (err) return done(err);
            done();
         });
      });
   });
});

//This date has no entry in it. If tests are failing because it does, change this
const emptyDate = '08-15-2022'

describe('POST /journal-entries sad paths', function(){
   it(`Returns 400 and "Put in a value for "weight"`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.weight = undefined;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`Put in a value for "weight"`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "Put in a value for "exercise_goal_met"`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.exercise_goal_met = undefined;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`Put in a value for "exercise_goal_met"`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "Put in a value for "caloric_intake"`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.caloric_intake = undefined;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`Put in a value for "caloric_intake"`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "Put in a value for "protein_intake"`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.protein_intake = undefined;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`Put in a value for "protein_intake"`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "weight" must be a number`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.weight = true;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`"weight" must be a number`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "exercise_goal_met" must be a boolean`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.exercise_goal_met = 12;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`"exercise_goal_met" must be a boolean`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "caloric_intake" must be a number`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.caloric_intake = true;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`"caloric_intake" must be a number`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "protein_intake" must be a number`, done => {
      let newEntryDataCopy = Object.assign({}, newEntryData);
      newEntryDataCopy.protein_intake = true;
      app
      .post(`/journal-entries/${emptyDate}`)
      .send(newEntryDataCopy)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`"protein_intake" must be a number`);
         if (err) return done(err);
         done();
      });
   });

   it(`Returns 400 and "The entered date is invalid"`, done => {
      app
      .post(`/journal-entries/08-2d-2022`)
      .send(newEntryData)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`The entered date is invalid`);
         if (err) return done(err);
         done();
      });
   });
   it('Returns "The entered date is in the future" when an entered date is in the future', done => {
      app.
      post('/journal-entries/12-31-9999')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is in the future");
          if (err) return done(err);
          done();
      });
   });
   it(`Returns 400 and "An entry for this date already exists"`, done => {
      app
      .post(`/journal-entries/08-24-2022`)   //An entry for this date *should* exist right now. If it doesn't, add it manually
      .send(newEntryData)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`An entry for this date already exists`);
         if (err) return done(err);
         done();
      });
   });
});

describe('PUT /journal-entries sad paths', function(){
   it(`Returns 400 and "The entered date is invalid"`, done => {
      app
      .put(`/journal-entries/08-2d-2022`)
      .send(modifiedEntryData)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`The entered date is invalid`);
         if (err) return done(err);
         done();
      });
   });
   it('Returns "The entered date is in the future" when an entered date is in the future', done => {
      app.
      put('/journal-entries/12-31-9999')
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
        expect(res.statusCode).to.equal(400);
        expect(res.text).to.equal("The entered date is in the future");
          if (err) return done(err);
          done();
      });
   });
   it(`Returns 400 and "An entry for this date does not exist"`, done => {
      app
      .put(`/journal-entries/08-30-2022`) //This date should NOT have an entry.
      .send(modifiedEntryData)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`An entry for this date does not exist`);
         if (err) return done(err);
         done();
      });
   });
});

describe('DELETE /journal-entries sad paths', function(){
   it(`Returns 400 and "The entered date is invalid"`, done => {
      app
      .put(`/journal-entries/08-2d-2022`)
      .send(modifiedEntryData)
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`The entered date is invalid`);
         if (err) return done(err);
         done();
      });
   });
   it(`Returns 400 and "An entry for this date does not exist"`, done => {
      app
      .delete(`/journal-entries/08-30-2022`) //This date should NOT have an entry.
      .end((err, res) => {
         console.log(`res code: ${res.statusCode} text: ${res.text}`);
         expect(res.statusCode).to.equal(400);
         expect(res.text).to.equal(`An entry for this date does not exist`);
         if (err) return done(err);
         done();
      });
   });
});
//One last test I didn't realize I needed until the last minute

//This user has no journal entries
const emptyUserData = {
   username: "testuser10",
   password: "p@ssw0rd"
}

describe('GET /summary from a user with no journal entries', function(){
   describe('GET /summary', function(){
      before('log out', logoutUser());
      before('log in', loginUser(emptyUserData));
      it(`Returns 400 and "No entries found in the specified dates" for a user with no journal entries`, done => {
         app
         .get(`/summary`) //This date should NOT have an entry.
         .end((err, res) => {
            console.log(`res code: ${res.statusCode} text: ${res.text}`);
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.equal(`No entries found in the specified dates`);
            if (err) return done(err);
            done();
         });
      });
   });
});