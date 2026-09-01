const express = require("express")

const {

    create,

    list,

    read,

    update,

    remove,

    searchFilters

} = require("../controllers/products")


const router = express.Router()


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck

} = require("../middlewares/authCheck")


const {

    requireAuth

} = require("../middlewares/authorize")


// ======================================================
// GET ALL PRODUCTS
// ======================================================

router.get(

    "/products",

    authCheck,

    requireAuth,

    list

)


// ======================================================
// GET ONE PRODUCT
// ======================================================

router.get(

    "/product/:id",

    authCheck,

    requireAuth,

    read

)


// ======================================================
// CREATE PRODUCT
// ======================================================

router.post(

    "/product",

    authCheck,

    requireAuth,

    create

)


// ======================================================
// UPDATE PRODUCT
// ======================================================

router.put(

    "/product/:id",

    authCheck,

    requireAuth,

    update

)


// ======================================================
// DELETE PRODUCT
// ======================================================

router.delete(

    "/product/:id",

    authCheck,

    requireAuth,

    remove

)


// ======================================================
// SEARCH PRODUCTS
// ======================================================

router.post(

    "/products/search",

    authCheck,

    requireAuth,

    searchFilters

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
