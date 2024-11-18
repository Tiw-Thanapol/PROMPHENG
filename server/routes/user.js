const express = require('express')
const { listUsers, changeStatus, changeRole,
    userCart, getUserCart, emptyCart,
    saveAddress, saveOrder, getOrder ,userProfile
} = require('../controllers/user')
const { authCheck, adminCheck } = require('../middlewares/authCheck')
const router = express.Router()

// Admin Routes
router.get('/users', authCheck, adminCheck, listUsers)
router.post('/change-status', authCheck, adminCheck, changeStatus)
router.post('/change-role', authCheck, adminCheck, changeRole)

//Cart Routes
router.post('/user/cart', authCheck, userCart)
router.get('/user/cart',authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyCart)

// Address Routes - ต้องมีการ authenticate
router.post('/user/address', authCheck, saveAddress)
router.get('/profile', authCheck, userProfile)
router.put('/profile', authCheck, userProfile)

// Order Routes - ต้องมีการ authenticate
router.post('/user/order', authCheck, saveOrder)
router.get('/user/order', authCheck, getOrder)




module.exports = router