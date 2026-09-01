
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

} = require('../controllers/consignment')


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
// CREATE
// POST /api/consignment
// ======================================================

router.post(

    '/consignment',

    authCheck,
    requireAuth,

    create

)


// ======================================================
// READ ALL
// GET /api/consignments
// ======================================================

router.get(

    '/consignments',

    authCheck,
    requireAuth,

    list

)


// ======================================================
// READ ONE
// GET /api/consignment/:id
// ======================================================

router.get(

    '/consignment/:id',

    authCheck,
    requireAuth,

    read

)


// ======================================================
// UPDATE
// PUT /api/consignment/:id
// ======================================================

router.put(

    '/consignment/:id',

    authCheck,
    requireAuth,

    update

)


// ======================================================
// DELETE
// DELETE /api/consignment/:id
// ======================================================

router.delete(

    '/consignment/:id',

    authCheck,
    requireAuth,

    remove

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
