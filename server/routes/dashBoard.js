
const express = require("express")

const router = express.Router()


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck

} = require("../middlewares/authCheck")

const {

    requireAuth

} = require("../middlewares/authorize")


// ======================================================
// CONTROLLER
// ======================================================

const {

    dashboard

} = require("../controllers/dashBoard")


// ======================================================
// DASHBOARD
// GET /api/dashboard
// ======================================================

router.get(

    "/dashboard",

    authCheck,
    requireAuth,

    dashboard

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
