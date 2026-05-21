const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const startRenewalCron = require('./utils/renewalCron')
const { handleWebhook } = require('./controllers/subscriptionController')

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
  'http://localhost:5173'
]
  .filter(Boolean)
  .flatMap(value => value.split(','))
  .map(value => value.trim().replace(/\/+$/, ''))
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)

    const normalizedOrigin = origin.replace(/\/+$/, '')
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`))
  },
  credentials: true
}))

// IMPORTANT: webhook route must be registered before express.json()
app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

startRenewalCron()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/subscriptions', require('./routes/subscriptions'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/scores', require('./routes/scores'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/users', require('./routes/users'))
app.use('/api/draws', require('./routes/draws'))
app.use('/api/charities', require('./routes/charities'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/winners', require('./routes/winners'))

app.get('/', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
