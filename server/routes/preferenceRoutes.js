const express = require('express')
const protect = require('../middleware/auth')
const { getPreferences, updatePreferences } = require('../controllers/preferenceController')

const router = express.Router()

router.use(protect)

router.get('/', getPreferences)
router.put('/', updatePreferences)

module.exports = router