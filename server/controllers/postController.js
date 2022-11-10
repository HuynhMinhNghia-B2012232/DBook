const { query } = require('express');
const Post = require('./../models/postModel');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// const checkAuthor = async (userId, postId) => {
//   const authorPost = JSON.stringify(await Post.findById(postId).author);
//   const user = JSON.stringify(userId);
//   return authorPost === user;
// };

exports.getAllPosts = catchAsync(async (req, res, next) => {
  console.log(req.query);

  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    reqAt: req.requestTime,
    result: posts.length,
    data: {
      posts
    }
  });
});

exports.getAllPostsOfMe = catchAsync(async (req, res, next) => {
  req.query = { author: req.user._id };
  this.getAllPosts(req, res, next);
});

exports.createPost = catchAsync(async (req, res, next) => {
  let newPost = req.body;
  console.log(newPost);
  newPost.author = req.user._id;
  console.log(newPost);

  await Post.create(newPost);

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return next(new AppError('No post found with id: ' + req.params.id, 404));

  res.status(200).json({
    message: 'success',
    data: { post }
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const role = req.user.role;
  // console.log(role);

  const authorPost = JSON.stringify(
    (await Post.findById(req.params.id)).author
  );
  const User = JSON.stringify(req.user._id);

  //Kiem tra co la tac gia cua post
  if (role === 'admin' || authorPost === User) {
    // console.log('UPDATEEEEEEEEEE');

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!post)
      return next(new AppError('No post found with id: ' + req.params.id, 404));

    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } else {
    return next(new AppError('You are not allowed to update this post', 401));
  }
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const role = req.user.role;
  // console.log(role);

  const authorPost = JSON.stringify(
    (await Post.findById(req.params.id)).author
  );
  const User = JSON.stringify(req.user._id);

  //Kiem tra co la tac gia cua post
  if (role === 'admin' || authorPost === User) {
    // console.log('DELETEEEEEE');

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post)
      return next(new AppError('No post found with id: ' + req.params.id, 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  } else {
    return next(new AppError('You are not allowed to delete this post', 401));
  }
});
