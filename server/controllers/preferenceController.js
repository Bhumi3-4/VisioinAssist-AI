const User = require('../models/User')

/**
 * GET /api/preferences
 * Returns the logged-in user's saved accessibility preferences.
 */
async function getPreferences(req, res) {
  try {
    const user = await User.findById(req.userId).select('preferences')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user.preferences)
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch preferences', error: err.message })
  }
}

/**
 * PUT /api/preferences
 */
async function updatePreferences(req, res) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    Object.assign(user.preferences, req.body)
    await user.save()

    res.json(user.preferences)
  } catch (err) {
    res.status(500).json({ message: 'Could not update preferences', error: err.message })
  }
}

module.exports = { getPreferences, updatePreferences }