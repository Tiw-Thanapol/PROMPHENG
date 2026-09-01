const express = require("express")

const router = express.Router()

const { authCheck } =
    require("../middlewares/authCheck")

const {
    getProductHistory
} = require("../controllers/productHistory")


// ======================================================
// GET PRODUCT HISTORY
// GET /api/product/:id/history
// ======================================================

router.get(
    "/product/:id/history",
    authCheck,
    getProductHistory
)


module.exports = router