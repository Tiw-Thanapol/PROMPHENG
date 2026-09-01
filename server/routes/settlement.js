const express = require('express')

const router = express.Router()


const {

    ownerSettlement

} = require('../controllers/settlement')


const {

    authCheck

} = require('../middlewares/authCheck')


// ======================================================
// OWNER SETTLEMENT
// GET /api/owners/:id/settlement
// ======================================================

router.get(

    '/owners/:id/settlement',

    authCheck,

    ownerSettlement

)


module.exports = router