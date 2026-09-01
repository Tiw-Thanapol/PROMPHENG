
const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    summary,

    salesTrend

} = require('../controllers/report')


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
// REPORT
// ======================================================


// ======================================================
// DASHBOARD SUMMARY
// GET /api/reports/summary
// ======================================================

router.get(

    '/reports/summary',

    authCheck,
    requireAuth,

    summary

)


// ======================================================
// SALES TREND
// GET /api/reports/sales-trend
// ======================================================

router.get(

    '/reports/sales-trend',

    authCheck,
    requireAuth,

    salesTrend

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
