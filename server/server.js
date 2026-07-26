require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const historyRoutes = require('./routes/historyRoutes')
const preferenceRoutes = require('./routes/preferenceRoutes')

const app = express()

// Allows the deployed frontend (and local dev) to call this API.
// Replace with your actual Vercel URL once deployed.
const allowedOrigins = ['http://localhost:5173', 'https://visioin-assist-ai.vercel.app']
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

connectDB()

app.get('/', (req, res) => {
  res.json({ status: 'VisionAssist AI backend is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/preferences', preferenceRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
