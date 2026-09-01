
const express = require("express")

const router = express.Router()


// ======================================================
// CONTROLLER
// ======================================================

const {

    getOrders,

    getOrderById,

    createOrder,

    getAccounting

} = require("../controllers/orders")


// ======================================================
// AUTHENTICATION
// ======================================================

const {

    authCheck

} = require("../middlewares/authCheck")


// ======================================================
// AUTHORIZATION
// ======================================================

const {

    requireAuth

} = require("../middlewares/authorize")


// ======================================================
// ACCOUNTING
// ======================================================
//
// ต้อง Login ก่อน
//
// authCheck
//     ↓
// ตรวจ Session / User
//
// requireAuth
//     ↓
// ตรวจว่ามี Authenticated User จริง
//
// ======================================================

router.get(

    "/orders/accounting",

    authCheck,

    requireAuth,

    getAccounting

)


// ======================================================
// GET ALL ORDERS
// ======================================================

router.get(

    "/orders",

    authCheck,

    requireAuth,

    getOrders

)


// ======================================================
// GET ONE ORDER
// ======================================================

router.get(

    "/orders/:id",

    authCheck,

    requireAuth,

    getOrderById

)


// ======================================================
// CREATE ORDER
// ======================================================

router.post(

    "/orders",

    authCheck,

    requireAuth,

    createOrder

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
