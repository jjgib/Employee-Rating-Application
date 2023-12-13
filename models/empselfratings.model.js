const mongoose = require('mongoose');

const selfRatingSchema = mongoose.Schema({
    employeeId: mongoose.Types.ObjectId,
    QA_rate: { 
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 },
        q4: { type: Number, default: 0 },
        q5: { type: Number, default: 0 },
        q6: { type: Number, default: 0 },
        q7: { type: Number, default: 0 },
        q8: { type: Number, default: 0 },
        q9: { type: Number, default: 0 },
        q10: { type: Number, default: 0 },
        q11: { type: Number, default: 0 },
        q12: { type: Number, default: 0 },
        q13: { type: Number, default: 0 },
        q14: { type: Number, default: 0 },
        q15: { type: Number, default: 0 },
        q16: { type: Number, default: 0 },
        q17: { type: Number, default: 0 },
        q18: { type: Number, default: 0 },
        q19: { type: Number, default: 0 },
        q20: { type: Number, default: 0 }
    },
    total_rate: Number,
    dateSlotId: mongoose.Types.ObjectId,
    createdDateTime:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("empselfratings",selfRatingSchema);