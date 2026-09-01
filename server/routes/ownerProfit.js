const express = require('express')

const router = express.Router()


const {

    ownerProfit

} = require('../controllers/ownerProfit')


const {

    authCheck

} = require('../middlewares/authCheck')


// ======================================================
// GET OWNER PROFIT
// ======================================================

router.get(

    '/owners/:id/profit',

    authCheck,

    ownerProfit

)


module.exports = router