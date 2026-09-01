const express = require('express')

const router = express.Router()


// ======================================================
// CONTROLLER
// ======================================================

const {

    registerOwner

} = require('../controllers/ownerRegister')


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
// REGISTER OWNER
// POST /api/owner/register
// ======================================================

router.post(

    '/owner/register',

    authCheck,
    requireAuth,

    registerOwner

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
