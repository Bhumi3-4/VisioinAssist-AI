const ScanHistory = require('../models/ScanHistory')

/**
 * POST /api/history
 * Saves one detection/read/obstacle-alert result for the logged-in user.
 */
async function createEntry(req, res) {
  try {
    const { type, resultText } = req.body

    if (!type || !resultText) {
      return res.status(400).json({ message: 'type and resultText are required' })
    }

    const entry = await ScanHistory.create({ user: req.userId, type, resultText })
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Could not save history entry', error: err.message })
  }
}

/**
 * GET /api/history
 * Returns the logged-in user's most recent scans, newest first.
 */
async function getHistory(req, res) {
  try {
    const entries = await ScanHistory.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100)
    res.json(entries)
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch history', error: err.message })
  }
}

/**
 * DELETE /api/history/:id
 */
async function deleteEntry(req, res) {
  try {
    const entry = await ScanHistory.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!entry) {
      return res.status(404).json({ message: 'History entry not found' })
    }
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete history entry', error: err.message })
  }
}

module.exports = { createEntry, getHistory, deleteEntry }