const express = require("express");
const router = express.Router();

router.get('/get-playlists', (req, res) => {
    res.render('playlists');
})

module.exports = router;