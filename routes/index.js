const express = require("express");
const router = express.Router();
const loginRoutes = require('./login');
const moodRoutes = require('./mood');
const playlistRoutes = require('./get-playlists');

router.get('/', (req, res) => {
    res.render('landing');
})

router.use('/', moodRoutes);
router.use('/', loginRoutes);
router.use('/', playlistRoutes);

module.exports = router;