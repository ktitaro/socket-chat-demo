var express = require('express')
var router = express.Router()

router.get('/', (req, res) => {
    res.render('auth', { title: 'Auth' })
})

router.post('/', (req, res) => {
    const { username } = req.body

    if (!username) {
        return res.render('auth', {
            error: 'username is required',
            title: 'Auth',
        })
    }

    req.session.username = username
    res.redirect(301, '/chat')
})

module.exports = router
