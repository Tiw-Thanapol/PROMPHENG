
const express = require('express')

const router = express.Router()


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck

} = require('../middlewares/authCheck')


const {

    requireAuth

} = require('../middlewares/authorize')


// ======================================================
// CONTROLLERS
// ======================================================

const {

    getAuditLogs,

    getAuditLog

} = require('../controllers/auditlog')


// ======================================================
// AUDIT LOGS
// ======================================================

// GET /api/audit-logs
//
// ดู Audit Logs ทั้งหมด
//
// รองรับ query:
//
// ?action=CREATE
// ?entity=Sale
// ?entityId=45
// ?userId=4
// ?startDate=2026-08-26
// ?endDate=2026-08-26
//
// ======================================================

router.get(

    '/audit-logs',

    authCheck,
    requireAuth,

    getAuditLogs

)


// ======================================================
// SINGLE AUDIT LOG
// GET /api/audit-logs/:id
// ======================================================

router.get(

    '/audit-logs/:id',

    authCheck,
    requireAuth,

    getAuditLog

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
