const config =  require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const notesRoutes = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middlerware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const app = express()

//configuración previa de mongoose
mongoose.set('strictQuery', false)
//conectar a mongoDB
logger.info('connecting to', config.MONGODB_URL)
mongoose.connect(config.MONGODB_URL).then(() => {
    logger.info('connected to MongoDB')
}).catch(error => {
    logger.error('error connecting to MongoDD', error.message)
})

//configuraciones de los middelwere
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middlerware.requestLogger)

// se llaman las rutas de la app
app.use('/api/users', usersRouter)
app.use('/api/notes', notesRoutes)
app.use('/api/login', loginRouter)
//se llaman los middlewere que se utilizan para los errores
app.use(middlerware.unknownEndpoint)
app.use(middlerware.errorHandler)

module.exports = app
