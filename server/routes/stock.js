const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    create,
    list,
    summary,
    read,
    update,
    remove

} = require('../controllers/stock')


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
// STOCK
// ======================================================


// ======================================================
// CREATE
// POST /api/stock
// ======================================================

router.post(

    '/stock',

    authCheck,
    requireAuth,

    create

)


// ======================================================
// LIST
// GET /api/stock
// ======================================================

router.get(

    '/stock',

    authCheck,
    requireAuth,

    list

)


// ======================================================
// SUMMARY
// GET /api/stock/summary
// ======================================================

router.get(

    '/stock/summary',

    authCheck,
    requireAuth,

    summary

)


// ======================================================
// READ
// GET /api/stock/:id
// ======================================================

router.get(

    '/stock/:id',

    authCheck,
    requireAuth,

    read

)


// ======================================================
// UPDATE
// PUT /api/stock/:id
// ======================================================

router.put(

    '/stock/:id',

    authCheck,
    requireAuth,

    update

)


// ======================================================
// SELL
// PUT /api/stock/:id/sell
// ======================================================

// router.put(
//     '/stock/:id/sell',
//     authCheck,
//     requireAuth,
//     sell
// )


// ======================================================
// DELETE
// DELETE /api/stock/:id
// ======================================================

router.delete(

    '/stock/:id',

    authCheck,
    requireAuth,

    remove

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
