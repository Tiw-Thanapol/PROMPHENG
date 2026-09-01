const express = require('express')

const router = express.Router()

const customerController =
    require('../controllers/customer')


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
// CUSTOMER ROUTES
// ======================================================


// ======================================================
// CREATE CUSTOMER
// POST /api/customers
// POST /api/customer
// ======================================================

router.post(

    '/customers',

    authCheck,
    requireAuth,

    customerController.create

)

router.post(

    '/customer',

    authCheck,
    requireAuth,

    customerController.create

)


// ======================================================
// GET ALL CUSTOMERS
// GET /api/customers
// GET /api/customer
// ======================================================

router.get(

    '/customers',

    authCheck,
    requireAuth,

    customerController.list

)

router.get(

    '/customer',

    authCheck,
    requireAuth,

    customerController.list

)


// ======================================================
// GET CUSTOMER PURCHASE HISTORY
// GET /api/customers/:id/history
// GET /api/customer/:id/history
// ======================================================

router.get(

    '/customers/:id/history',

    authCheck,
    requireAuth,

    customerController.getCustomerHistory

)

router.get(

    '/customer/:id/history',

    authCheck,
    requireAuth,

    customerController.getCustomerHistory

)


// ======================================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// GET /api/customer/:id
// ======================================================

router.get(

    '/customers/:id',

    authCheck,
    requireAuth,

    customerController.read

)

router.get(

    '/customer/:id',

    authCheck,
    requireAuth,

    customerController.read

)


// ======================================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// PUT /api/customer/:id
// ======================================================

router.put(

    '/customers/:id',

    authCheck,
    requireAuth,

    customerController.update

)

router.put(

    '/customer/:id',

    authCheck,
    requireAuth,

    customerController.update

)


// ======================================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// DELETE /api/customer/:id
// ======================================================

router.delete(

    '/customers/:id',

    authCheck,
    requireAuth,

    customerController.remove

)

router.delete(

    '/customer/:id',

    authCheck,
    requireAuth,

    customerController.remove

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
