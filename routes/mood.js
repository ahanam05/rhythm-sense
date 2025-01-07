const express = require("express");
const router = express.Router();
const moodController = require('../controller/mood');

router.get('/mood', moodController.mood_get);

module.exports = router;