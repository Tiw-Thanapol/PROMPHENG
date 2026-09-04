const express = require("express")

const router =
    express.Router()


const {
    submitFeedback
} = require("../controllers/feedback")


const {
    authCheck
} = require("../middlewares/authCheck")


// ======================================================
// FEEDBACK
// ======================================================

router.post(
    "/feedback",
    authCheck,
    submitFeedback
)


module.exports = router