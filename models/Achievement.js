const mongoose = require('mongoose');

const achievementSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    
})