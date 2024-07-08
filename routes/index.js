const express = require('express')
const router = express.Router()

const homeController = require('../controller/home_controller');

router.get('/', homeController.home);
router.get('/listTransactions', homeController.listTransactions);
router.get('/getStats', homeController.getStats);
router.get('/getPriceRangeDistribution', homeController.getPriceRangeDistribution);
router.get('/getCategoryDistribution', homeController.getCategoryDistribution);
router.get('/getCombinedData', homeController.getCombinedData);


console.log("Router is Loaded");
module.exports = router;