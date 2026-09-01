
const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    deleteOwner,
    summary,
    sales

} = require('../controllers/owner')


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
// OWNER ROUTES
// ======================================================


// ======================================================
// CREATE OWNER
// POST /api/owner
// ======================================================

router.post(

    '/owner',

    authCheck,
    requireAuth,

    createOwner

)


// ======================================================
// READ ALL OWNERS
// GET /api/owners
// ======================================================

router.get(

    '/owners',

    authCheck,
    requireAuth,

    getOwners

)


// ======================================================
// READ ONE OWNER
// GET /api/owner/:id
// ======================================================

router.get(

    '/owner/:id',

    authCheck,
    requireAuth,

    getOwnerById

)


// ======================================================
// UPDATE OWNER
// PUT /api/owner/:id
// ======================================================

router.put(

    '/owner/:id',

    authCheck,
    requireAuth,

    updateOwner

)


// ======================================================
// DELETE OWNER
// DELETE /api/owner/:id
// ======================================================

router.delete(

    '/owner/:id',

    authCheck,
    requireAuth,

    deleteOwner

)


// ======================================================
// OWNER SUMMARY
// GET /api/owner/:id/summary
// ======================================================

router.get(

    '/owner/:id/summary',

    authCheck,
    requireAuth,

    summary

)


// ======================================================
// OWNER SALES
// GET /api/owner/:id/sales
// ======================================================

router.get(

    '/owner/:id/sales',

    authCheck,
    requireAuth,

    sales

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
