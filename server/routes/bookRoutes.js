const express = require('express');
const bookController = require('./../controllers/bookController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(authController.protect, bookController.createBook);

router.route('/:id').get(bookController.getBook);

router.route('/search/:key').get(bookController.searchBook);

router.route('');

module.exports = router;
