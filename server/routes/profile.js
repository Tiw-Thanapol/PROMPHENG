const express = require('express')

const router = express.Router()

const {
    getProfile,
    updateProfile,
    updateAvatar
} = require('../controllers/profile')

const {
    authCheck
} = require('../middlewares/authCheck')


const upload = require('../middlewares/upload')
// ======================================================
// PROFILE
// ======================================================

// GET PROFILE
router.get(
    '/profile',
    authCheck,
    getProfile
)

// UPDATE PROFILE
router.put(
    '/profile',
    authCheck,
    updateProfile
)

// UPDATE AVATAR
router.put(
    '/profile/avatar',
    authCheck,
    upload.single("picture"),
    updateAvatar
)

module.exports = router