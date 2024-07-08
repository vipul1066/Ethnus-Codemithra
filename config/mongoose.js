const { default: mongoose } = require('mongoose')
const mongodb = require('mongoose');

// Adjust the mongodb setup according to your system
mongoose.connect('mongodb://localhost:27017/Codemithra').catch(error => console.err(error))

const db = mongoose.connection

// If Any Connection Error Occurred
db.on('error', function(err){console.log(err.message)})

//If successfully connected to the mongodb
db.once('open', ()=>{
  console.log("Successfully connected to the database.");
})

module.export = db;
