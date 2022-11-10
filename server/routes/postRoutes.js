const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/posts-of-me')
  .get(authController.protect, postController.getAllPostsOfMe);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

module.exports = router;
