const mongoose = require('mongoose');

const TransactionsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
  },
  category:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  price:{
    type: Number
  },
  dateOfSale: {
    type: Date
  },
  sold:{
    type: Boolean
  },
  month:{
    type:Number
  }
});

TransactionsSchema.pre('save', function(next) {
  this.month = this.dateOfSale.getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  next();
});

const Transaction = mongoose.model('Transaction', TransactionsSchema);
module.exports = Transaction;