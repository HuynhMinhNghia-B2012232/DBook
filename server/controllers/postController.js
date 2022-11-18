const { query } = require('express');
const Post = require('./../models/postModel');
const bookController = require('./../controllers/bookController');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// const checkAuthor = async (userId, postId) => {
//   const authorPost = JSON.stringify(await Post.findById(postId).author);
//   const user = JSON.stringify(userId);
//   return authorPost === user;
// };

const getUpdate = (action, beforeVote) => {
  var update = { action: 'none', math: 0 };

  if (!beforeVote) {
    update.action = action;
    switch (action) {
      case 'like': {
        update.math = 1;
        break;
      }
      case 'hate': {
        update.math = -1;
        break;
      }
      default: {
        update.math = 0;
      }
    }
  } else {
    if (action === 'like') {
      if (beforeVote.action === 'like') {
        update.action = 'none';
        update.math = -1;
      } else {
        update.action = 'like';
        update.math = 1;
      }
    } else if (action === 'hate') {
      if (beforeVote.action === 'hate') {
        update.action = 'none';
        update.math = 1;
      } else {
        update.action = 'hate';
        update.math = -1;
      }
    } else if (action === 'none') {
      if (beforeVote.action === 'hate') {
        update.math = 1;
      } else if (beforeVote.action === 'like') {
        update.math = -1;
      }
    }
  }

  return update;
};

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
  newPost.author = req.user._id;
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

  await Post.findByIdAndUpdate(
    req.params.id,
    {
      $inc: { viewsQuantity: 1 }
    },
    {
      new: true,
      runValidators: true
    }
  );

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
  } else
    return next(new AppError('You are not allowed to update this post', 401));
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

    res.status(200).json({
      status: 'success',
      data: null
    });
  } else {
    return next(new AppError('You are not allowed to delete this post', 401));
  }
});

exports.votePost = catchAsync(async (req, res, next) => {
  const authorPost = JSON.stringify(
    (await Post.findById(req.body.post_id)).author
  );

  console.log(req.user);
  const User = JSON.stringify(req.user._id);

  //Neu la tac gia thi khong duoc vote
  console.log(authorPost, User);
  console.log(authorPost === User);
  if (authorPost === User) {
    return next(
      new AppError(
        'You are not allowed to vote because you are the author',
        400
      )
    );
  }

  const voters = (await Post.findById(req.body.post_id)).voters;
  const beforeVote = voters.find(x => JSON.stringify(x.voter_id) === User);
  const update = getUpdate(req.body.action, beforeVote);

  var updateData = {};
  if (!beforeVote) {
    updateData = {
      $push: { voters: { voter_id: req.user._id, action: update.action } },
      $inc: { vote: update.math }
    };
  } else {
    updateData = {
      $set: { voters: { voter_id: req.user._id, action: update.action } },
      $inc: { vote: update.math }
    };
  }

  const post = await Post.findByIdAndUpdate(req.body.post_id, updateData, {
    new: true,
    runValidators: true
  });

  console.log(post);
  res.status(200).json({
    status: 'success',
    action: update.action,
    point: post.vote
  });
});
