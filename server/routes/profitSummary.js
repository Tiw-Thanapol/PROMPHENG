const express = require('express')

const router = express.Router()


const {
    profitSummary
} = require('../controllers/profitSummary')


const {
    authCheck
} = require('../middlewares/authCheck')


// ======================================================
// PROFIT SUMMARY
// GET /api/profit/summary
// ======================================================

router.get(

    '/profit/summary',

    authCheck,

    profitSummary

)


module.exports = router