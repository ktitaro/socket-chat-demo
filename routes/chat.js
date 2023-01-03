var express = require('express')
var router = express.Router()

router.get('/', (req, res) => {
    const { username } = req.session
    if (!username) return res.redirect('/auth')
    res.render('chat', {
        title: 'Room',
        username,
    })
})

module.exports = router
