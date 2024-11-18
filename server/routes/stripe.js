//import ...
const express = require('express')
const { authCheck } = require('../middlewares/authCheck')
const { payment } = require('../controllers/stripe')
const router = express.Router()
//import controller


router.post('/user/create-payment-intent', authCheck, payment ) 



module.exports = router