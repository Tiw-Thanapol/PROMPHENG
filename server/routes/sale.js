
const express = require("express")

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    create,
    list,
    read

} = require("../controllers/sale")


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
// CREATE SALE
// POST /api/sale
// ======================================================

router.post(

    "/sale",

    authCheck,
    requireAuth,

    create

)


// ======================================================
// GET ALL SALES
// GET /api/sales
// ======================================================

router.get(

    "/sales",

    authCheck,
    requireAuth,

    list

)


// ======================================================
// GET SALE BY ID
// GET /api/sale/:id
// ======================================================

router.get(

    "/sale/:id",

    authCheck,
    requireAuth,

    read

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
