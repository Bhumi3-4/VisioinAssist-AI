const mongoose = require('mongoose')


const scanHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['object-detection', 'text-recognition', 'obstacle-alert'],
      required: true,
    },
    resultText: { type: String, required: true }, 
  },
  { timestamps: true },
)

module.exports = mongoose.model('ScanHistory', scanHistorySchema)