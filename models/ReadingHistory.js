const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper'
  },
  action: {
    type: String,
    enum: ['uploaded', 'viewed', 'interpreted', 'searched', 'questioned'],
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeSpent: { // 分钟
    type: Number,
    default: 0/
  },
  engagementScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  knowledgeGapsIdentified: [{
    concept: String,
    difficulty: String,
    timesEncountered: Number
  }],
  strengthsDemonstrated: [{
    concept: String,
    performance: Number
  }]
});

// 复合索引用于快速查询用户历史
readingHistorySchema.index({ userId: 1, timestamp: -1 });
readingHistorySchema.index({ userId: 1, paperId: 1 });

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
