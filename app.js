require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use('/api', require('./routes/index'))

app.use(errorMiddleware)

const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 8080

		await mongoose.connect(process.env.MONGO_URL)
		console.log('Connected to DB')

		app.listen(PORT, () => console.log(`Listening on - http://localhost:${PORT}`))
	} catch (error) {
		console.log(`Error connecting to DB: ${error}`)
	}
}

bootstrap()
