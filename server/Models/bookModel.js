const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bookSchema = new mongoose.Schema({
  title: {
    type: String
  },
  subtitle: {
    type: [String]
  },
  authors: {
    type: [String]
  },
  publisher: {
    type: String
  },
  decription: {
    type: String
  },
  categories: {
    type: [String]
  },
  imageLinks: {
    smallThumbnail: { type: String },
    thumbnail: { type: String }
  },
  reviewsQuantity: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  postReview: {
    type: [Schema.Types.ObjectId],
    ref: 'Post'
  },
  userReview: {
    type: [Schema.Types.ObjectId],
    ref: 'User'
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
