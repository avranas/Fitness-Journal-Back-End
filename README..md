# AVranas Daily Fitness Journal

avranas-daily-fitness-journal is a project being developed for the final open-ended project in Codecademy's Back-End-Engineer path

It allows users to keep track of their fitness goals using daily journal entries, which keep track of their weight, caloric intake, protein intake, and any other notes that the user would like to record.

## This app has cool features like:
1. Provides a summary of your progress since the start
2. Provides a summary of your progress over the last X amount of days
3. Keeps track of longest chain of days you’ve completed your goal

## Each summary contains
1. Average, min, and max caloric intake
2. Average, min, and max protein intake
3. Average daily weight change, also biggest gain, and biggest loss
4. % of days you stuck with your goal

## How to Use
1. Create an account with a username, password, current weight, and target weight
2. Enter new journal entries with POST /journal_entries/:entry_date
3. Get previous journal entries with GET /journal_entries
4. Get summaries of fitness data with GET /summary

## Technologies
1. Node.js
2. ExpressJS
3. Postgres
4. Sequelize
5. Cors
6. Passport + bcrypt
7. Mocha/Chai/Supertest