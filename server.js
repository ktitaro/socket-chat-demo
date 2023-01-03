const path = require('path')
const http = require('http')
const logger = require('morgan')
const express = require('express')
const socketIO = require('socket.io')
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const debug = require('debug')('chat-app:server')

const port = Number(process.env.PORT || '3000')
const host = String(process.env.HOST || 'localhost')
const secret = String(process.env.SECRET || 'secret')

const basePath = path.resolve(__dirname)
const viewsPath = path.join(basePath, 'views')
const assetsPath = path.join(basePath, 'public')

function runServer() {
  const app = express()
  const server = http.createServer(app)
  const wsServer = new socketIO.Server(server)

  const session = expressSession({
    saveUninitialized: true,
    resave: false,
    secret,
  })

  app.set('views', viewsPath)
  app.set('view engine', 'hbs')
  app.set('trust proxy', 1)

  app.use(logger('dev'))
  app.use(express.json())
  app.use(cookieParser())
  app.use(express.urlencoded({ extended: false }))
  app.use(express.static(assetsPath))
  app.use(session)

  app.use('/', (req, res, next) => next())
  app.use('/auth', require('./routes/auth'))
  app.use('/chat', require('./routes/chat'))
  app.use((req, res, next) => next(createError(404)))
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err,
    })
  })

  wsServer.use((socket, next) => {
    session(socket.request, {}, next)
  })

  wsServer.use((socket, next) => {
    const session = socket.request.session
    if (session && session.username) next()
    else next(new Error('unauthorized'))
  })

  wsServer.on('connection', async (socket) => {
    const { username } = socket.request.session
    const members = (await wsServer.fetchSockets())
      .map((socket) => ({ username: socket.request.session.username }))
      .filter(({ username: musername }) => musername != username)

    socket.emit('members', members)
    socket.emit('myself', { username })
    wsServer.emit('join', { username })

    socket.on('message', (message) => {
      wsServer.emit('message', {
        username,
        message,
      })
    })

    socket.on('disconnect', () => {
      wsServer.emit('left', {
        username,
      })
    })
  })

  server.listen(port, host, () => {
    const addr = `http://${host}:${port}`
    debug(`✨ Listening on ${addr}`)
  })
}

runServer()