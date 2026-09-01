
// ======================================================
// ADMIN ROUTES
// routes/admin.js
// ======================================================

const express = require("express")

const router = express.Router()


// ======================================================
// MIDDLEWARE
// ======================================================

const {
    authCheck
} = require("../middlewares/authCheck")


const {
    requireAdmin
} = require("../middlewares/authorize")


// ======================================================
// CONTROLLER
// ======================================================

const {
    changeOrderStatus,
    getOrderAdmin
} = require("../controllers/admin")


// ======================================================
// ADMIN ORDER STATUS
// PUT /api/admin/order-status
// ======================================================

router.put(

    "/admin/order-status",

    authCheck,

    requireAdmin,

    changeOrderStatus

)


// ======================================================
// ADMIN ORDERS
// GET /api/admin/orders
// ======================================================

router.get(

    "/admin/orders",

    authCheck,

    requireAdmin,

    getOrderAdmin

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
