// ======================================================
// ANALYZE ROUTE
// routes/analyze.js
// ======================================================

const express = require("express")

const router = express.Router()


// ======================================================
// CONTROLLER
// ======================================================

const {

    analyzeController

} = require("../controllers/analyze")


// ======================================================
// AUTHORIZATION
// ======================================================

const {

    authCheck

} = require("../middlewares/authCheck")

const {

    requireAuth

} = require("../middlewares/authorize")


// ======================================================
// ROUTE
// ======================================================

router.post(

    "/ai/analyze",

    authCheck,
    requireAuth,

    analyzeController

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
