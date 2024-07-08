const express = require('express')
const app = express()
const path = require('path');
const port = 3000

const db = require('./config/mongoose');
const Transaction = require('./models/transactions');


// Use express app router 
app.use('/', require('./routes/index'));

// Use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('assets'));

// app.get('/', (req, res) => {
//   res.send("Hello World");
// })

app.listen(port, ()=> {
  console.log(`Express app is running on port: ${port}`);
})