const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  authors: [{
    type: String
  }],
  abstract: {
    type: String
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  subject: {
    type: String,
    enum: ['physics', 'chemistry', 'biology', 'environmental', 'geology', 'astronomy', 'other'],
    default: 'other'
  },
  keywords: [{
    type: String
  }],
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  interpretation: {
    content: String,
    generatedAt: Date,
    tokensUsed: Number,
    modelUsed: String
  },
  qaHistory: [{
    question: String,
    answer: String,
    askedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readingStats: {
    totalTimeSpent: { // 分钟
      type: Number,
      default: 0
    },
    lastAccessed: Date,
    sectionsCompleted: [String]
  },
  metadata: {
    publicationDate: Date,
    journal: String,
    doi: String,
    pages: Number
  }
});

// 创建文本索引以便搜索
paperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

module.exports = mongoose.model('Paper', paperSchema);
