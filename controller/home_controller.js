const transactions = require('../models/transactions')
const axios = require('axios');
const months = {
  1: 'JAN',
  2: 'FEB',
  3: 'MAR',
  4: 'APR',
  5: 'MAY',
  6: 'JUN',
  7: 'JUL',
  8: 'AUG',
  9: 'SEP',
  10: 'OCT',
  11: 'NOV',
  12: 'DEC'
};


module.exports.home = async function(req, res){
  const month = parseInt(req.query.month) || 3
  const page = parseInt(req.query.page) || 1
  const search = req.query.search || ''
  console.log(search)
  const response  = await axios.get(`http://localhost:3000/getCombinedData?month=${month}&page=${page}&search=${search}`);
  const data = response.data;
  return res.render('index', data)
}

module.exports.listTransactions = async function(req, res){
  const month = parseInt(req.query.month) || 3
  const page = parseInt(req.query.page) || 1
  const limit = 10
  const search = req.query.search
  const minPrice = req.query.minPrice || 0
  const maxPrice = req.query.maxPrice || 999999
  //Pagination Skip Value
  const skipValue = (page - 1) * limit

  // Create Mongoose Query Object
  const query = {}

  // If search query is given
  if (search) {
    query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
    ];
}
  let allTransactions = await transactions.find(query)
  .where("price").gt(minPrice).lt(maxPrice)
  .where("month").equals(month)
  .skip(skipValue)
  .limit(limit)
  .exec();

  console.log(`Length of Month(${month}): ${allTransactions.length}`)

  return res.json(allTransactions)
};
/*
[CREATE AN API TO LIST THE ALL TRANSACTIONS]
- API should support search and pagination on product transactions
- Based on the value of search parameters, it should match search text on product
title/description/price and based on matching result it should return the product
transactions
- If search parameter is empty then based on applied pagination it should return all the
records of that page number
- Default pagination values will be like page = 1, per page = 10
*/

module.exports.getStats = async function(req, res){
  const targetMonth = parseInt(req.query.month) || 3

  // # - Total sale amount of selected month
  const totalSaleAmount = await transactions
  .aggregate([
    {
      $match: { month: targetMonth}
    },
    {
      $group:{
        _id: null,
        totalAmount: {$sum: '$price'}
      }
    }
  ])

  // # - Total number of sold items of selected month
  const soldItems = await transactions.countDocuments({
    month: targetMonth,
    sold: true
  })

    // # - Total number of not sold items of selected month
    const notSoldItems = await transactions.countDocuments({
      month: targetMonth,
      sold: false
    })

    const data = {
      'totalSaleAmount': totalSaleAmount[0].totalAmount,
      'soldItems': soldItems,
      'notSoldItems': notSoldItems
    }

  return res.json(data);

};
/*
[CREATE AN API FOR STATISTICS]
- Total sale amount of selected month
- Total number of sold items of selected month
- Total number of not sold items of selected month
*/

module.exports.getPriceRangeDistribution = async function(req, res){
  const targetMonth = parseInt(req.query.month)
  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity }
];


  for(let range of priceRanges){
    range.count = await transactions.countDocuments({
      month: targetMonth,
      price: {
        $gte: range.min,
        $lte: range.max
      }
    }).exec();
    range.month = targetMonth
  }

  const barChartData = priceRanges.map(item => ({
    range: item.range,
    count: item.count
  }))
  
  return res.json(barChartData);
};
/*
[CREATE AN API FOR BAR CHART]
Create an API for bar chart ( the response should contain price range and the number of items in that range for the selected month regardless of the year )
- 0-100
- 101-200
- 201-300
- 301-400
- 401-500
- 501-600 
- 601-700
- 701-800
- 801-900
- 901-above
*/


module.exports.getCategoryDistribution = async function(req, res){
  const month = parseInt(req.query.month)

  const categoryCounts = await transactions.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1}
      }
    }
  ]);

  return res.json(categoryCounts);
};
/*
[CREATE AN API FOR PIE CHART]
Create an API for pie chart Find unique categories and number of items from that category for the selected month regardless of the year.
For example :
- X category : 20 (items)  Mens
- Y category : 5 (items)  Womens
- Z category : 3 (items)  Tech
*/

module.exports.getCombinedData = async function(req, res){
  const month = parseInt(req.query.month) || 3
  const page = parseInt(req.query.page) || 1
  const search = req.query.search || ''
  const minPrice = req.query.minPrice || 0
  const maxPrice = req.query.maxPrice || 999999

  console.log(`http://localhost:3000/listTransactions?month=${month}&page=${page}&limit=10&minPrice=${minPrice}&maxPrice=${maxPrice}&search=${search}`);

  const [response1, response2, response3] = await Promise.all([
    axios.get(`http://localhost:3000/listTransactions?month=${month}&page=${page}&limit=10&minPrice=${minPrice}&maxPrice=${maxPrice}&search=${search}`),
    axios.get(`http://localhost:3000/getStats?month=${month}`),
    axios.get(`http://localhost:3000/getPriceRangeDistribution?month=${month}`)
  ]);

  console.log(response1.data.length);

  const combinedData = {
    listTransactions: response1.data,
    getStats: response2.data,
    getPriceRangeDistribution: response3.data,
    monthInText: months[month],
    month:month,
    page: page,
    search: search,
    nextPage: response1.data.length !== 10? "disabled":''
  };

  return res.json(combinedData);
};
/*
Create an API which fetches the data from all the 3 APIs mentioned above, combines the response and sends a final response of the combined JSON 
*/