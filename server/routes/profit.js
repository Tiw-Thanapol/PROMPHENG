const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLER
// ======================================================

const {

    saleProfit

} = require('../controllers/profit')


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck

} = require('../middlewares/authCheck')

const {

    requireAuth

} = require('../middlewares/authorize')


// ======================================================
// GET SALE PROFIT
// GET /api/sales/:id/profit
// ======================================================

router.get(

    '/sales/:id/profit',

    authCheck,
    requireAuth,

    saleProfit

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
