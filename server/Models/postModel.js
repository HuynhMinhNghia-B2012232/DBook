const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title'],
      minlength: [10, 'A post title must have more or equal then 10 characters']
    },
    slug: String,
    imageCover: {
      type: String
    },
    content: {
      type: String,
      required: [true, 'A post must have a content']
    },
    viewsQuantity: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 2.5,
      min: 0,
      max: 5
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
      // required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book'
      // required: true,
    },
    status: {
      type: Boolean
    }
  },
  { timestamps: true }
);

// DOCUMENT MIDDLEWARE
postSchema.pre('save', function (next) {
  let id = new String(this._id);
  id = id.substring(id.length - 12); // lay 12 ky tu cuoi trong id
  this.slug = slugify(`${this.title}-${id}`, { lower: true, locale: 'vi' });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
