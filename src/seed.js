const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../config/mongoose');
const Transaction =  require('../models/transactions');

const validateData = (data) => {
  return data.filter(item => 
      item.product_id && 
      item.title && 
      item.description && 
      item.price !== undefined && 
      item.dateOfSale && 
      item.sold !== undefined
  );
};

const seedData = async () => {

    try{
      const response  = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const data = response.data;

      for(let item of data){
        const newTransaction = new Transaction(item);
        await newTransaction.save()
      }
      // await Transaction.insertMany(data);
      // console.log(data);
      console.log("Database seeded Successfully");
      mongoose.connection.close();
      
    }catch(error){
      console.log(`Error Occured while seeding data : ${error}`);
    }
};

seedData();