const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get Score Model
const Score = require('../models/Score');

// GET  api/scores
router.get('/', (req, res) => {
    Score.find()
        .sort({score: -1}) // sort by highest score, desc
        .limit(20)
        .then(scores => res.json(scores));
});


// POST api/score
router.post('/save', (req, res) => {
    console.log("REQ BODY_____", req.body);
    
    const newScore = new Score({
        username: req.body.username,
        score: req.body.score
    });
    newScore.save().then(score => res.json(score));
});



module.exports = router;