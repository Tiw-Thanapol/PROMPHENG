const express = require('express')

const router = express.Router()

const {
    create,
    listBySale
} = require('../controllers/return')

const {
    authCheck
} = require('../middlewares/authCheck')


// ======================================================
// RETURN ITEM
// POST /api/returns/:saleItemId
// ======================================================

router.post(
    '/returns/:saleItemId',
    authCheck,
    create
)


// ======================================================
// RETURN HISTORY
// GET /api/returns/sale/:saleId
// ======================================================

router.get(
    '/returns/sale/:saleId',
    authCheck,
    listBySale
)


module.exports = router
