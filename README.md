# ffx_api
Technical Test Article API

To run: 
- *npm install*. 
- *npm start* or *nodemon*

You may set up a .env file if you wish for the *PORT* number. Otherwise the default port is 3000. 

For testing I'm using the Supertest and Jest libraries. These can be run by the command *npm run test* or *jest*

## Code description
This project was setup using express generator to set up the basic skeleton of the project. 

I've implemented pg-mem, a mock postgres database in memory, to mimic a database as part of this solution. 
This was to mimic how this project might look in a real world scenario and to reduce the number of operations I'd need to do if I were to implement the solution in memory. 

I've never used pg-mem before and found some of the features were not reliable such as utilising the pg-promise wrapper so I've just resorted to using the default which seems similar enough to pg-promise. To sanitise and format my queries I've utilised pg-promise's format command. 

The code is optimised as much as I can within the limitations of pg-mem. The rest of the operations are done in javascript. 

For this implementation error handling is just a simple error handler at the end of each endpoint. If I had a larger project I'd probably eventually migrate these to a different error handling section. Presumably with a custom built error handler to define common error types. 

For server side validation, I've used the Joi library which is extremely fast and easy to implement. If you haven't used it before, the code surrounding it should be self-explanatory. 

I've had some issues regarding timezones and Javascript dates, so for this instance I've had to do some workarounds just to uncomplicate things. 

Testing was done using a combination of manual testing in Postman, as well as Jest/Supertest testing. I've written a number of different tests in the tests folder and could probably honestly go on forever writing them if I had more time. I have hoped to have tackled the most obvious tests in this instance. Dummy data has about 1 article that I've copied from the internet, and I didn't really want to find any more so they've just been copied over and over with minor changes. 

## Assumptions

I've assumed in this instance an article does not have an id when posted. The db will generate an id for the article. For convenience, I've chosen to return the id that was generated so that the front end can reference it if needed. 

The requirements for the tags endpoint ask for the last 10 articles of the day. There's no real time associated with the articles so for this I've used the date posted and their article id. Since article ids are sequentially generated; to get the last 10, I order them in descending order and get 10 from the db. 
