const express = require('express')

const router = express.Router()

const {
    create,
    list,
    update,
    remove
} = require('../controllers/registrationCode')

const {
    authCheck,
    adminOnly
} = require('../middlewares/authCheck')

// ======================================================
// ADMIN ONLY
// ======================================================

router.post(
    '/admin/registration-codes',
    authCheck,
    adminOnly,
    create
)

router.get(
    '/admin/registration-codes',
    authCheck,
    adminOnly,
    list
)

router.put(
    '/admin/registration-codes/:id',
    authCheck,
    adminOnly,
    update
)

router.delete(
    '/admin/registration-codes/:id',
    authCheck,
    adminOnly,
    remove
)

module.exports = router