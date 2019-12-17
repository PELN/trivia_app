const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get Score Model
const Score = require('../models/Score');

// GET  api/scores
router.get('/', (req, res) => {
    Score.find().then(scores => res.json(scores));
});


// POST api/score
router.post('/post', (req, res) => {
    console.log("REQ BODY_____", req.body);
    const newScore = new Score({
        username: req.body.username,
        score: req.body.score
    });
    newScore.save().then(score => res.json(score));
});



module.exports = router;