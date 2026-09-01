const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    createOwnerPayment,
    ownerPaymentHistory,
    getOwnerPayment

} = require('../controllers/ownerPayment')


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
// CREATE OWNER PAYMENT
// POST /api/owners/:id/payments
// ======================================================

router.post(

    '/owners/:id/payments',

    authCheck,
    requireAuth,

    createOwnerPayment

)


// ======================================================
// PAYMENT HISTORY
// GET /api/owners/:id/payments
// ======================================================

router.get(

    '/owners/:id/payments',

    authCheck,
    requireAuth,

    ownerPaymentHistory

)


// ======================================================
// GET SINGLE PAYMENT
// GET /api/owners/:ownerId/payments/:paymentId
// ======================================================

router.get(

    '/owners/:ownerId/payments/:paymentId',

    authCheck,
    requireAuth,

    getOwnerPayment

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
