const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A book must have a title']
  },
  subtitle: {
    type: [String]
  },
  authors: {
    type: [String],
    required: [true, 'A book must have a author']
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
  }
});

bookSchema.index({ '$**': 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
