const express = require('express')
const protect = require('../middleware/auth')
const { createEntry, getHistory, deleteEntry } = require('../controllers/historyController')

const router = express.Router()

router.use(protect) 
router.post('/', createEntry)
router.get('/', getHistory)
router.delete('/:id', deleteEntry)

module.exports = router