const express = require("express");
const router = express.Router();
const tokenManager = require('../utils/tokenManager');

//get the query from the mood.ejs page, analyse it using an nlp library, map the mood to genre and pick a playlist of 5 songgs
//create a playlist and save it. display it as an iframe. 

//now - testing functionality of searching for songs and adding to playlist and saving it, later i'll do the nlp stuff



router.get('/get-playlists', (req, res) => {
    const access_token = tokenManager.getAccessToken();
    console.log("Received access token: ", access_token);
    res.render('playlists');
})

module.exports = router;