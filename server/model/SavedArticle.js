const mongoose = require('mongoose');

const SavedArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  urlToImage: { type: String }, // optional if you want to save the image too
  publishedAt: { type: Date, required: true },
  sourceName: { type: String }
});

const SavedArticle = mongoose.model('SavedArticle', SavedArticleSchema);

module.exports = SavedArticle;
