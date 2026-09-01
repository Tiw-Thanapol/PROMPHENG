
const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    create,
    list,
    read,
    update,
    remove

} = require('../controllers/expense')


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
// EXPENSE
// ======================================================


// ======================================================
// CREATE
// POST /api/expenses
// ======================================================

router.post(

    '/expenses',

    authCheck,
    requireAuth,

    create

)


// ======================================================
// LIST
// GET /api/expenses
// ======================================================

router.get(

    '/expenses',

    authCheck,
    requireAuth,

    list

)


// ======================================================
// READ BY ID
// GET /api/expenses/:id
// ======================================================

router.get(

    '/expenses/:id',

    authCheck,
    requireAuth,

    read

)


// ======================================================
// UPDATE
// PUT /api/expenses/:id
// ======================================================

router.put(

    '/expenses/:id',

    authCheck,
    requireAuth,

    update

)


// ======================================================
// DELETE
// DELETE /api/expenses/:id
// ======================================================

router.delete(

    '/expenses/:id',

    authCheck,
    requireAuth,

    remove

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
