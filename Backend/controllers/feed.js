const path = require('path')
const fs = require('fs')
const Post = require('../models/post')
const {validationResult} = require('express-validator/check')


exports.getPosts = (req, res, next) => {
  Post.find().then(posts =>{
    res.status(200).json({
      message:'Fetched posts successfully.',posts:posts
    })
  })
  .catch(err => {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  })
};

exports.getPost = (req,res,next) =>{
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('Could not find post')
        error.statusCode=404;
        throw error;
      }
      res.status(200).json({
        message:'Post fetched',post:post
      })
    })
    .catch(err=>{
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })

}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new Error('Validation is failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }
  if(!req.file){
    const error = new Error('No image provided.')
    error.statusCode=422;
    throw error
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\" ,"/");
  
  const post = new Post({
    title:title,
    imageUrl: imageUrl,
    content:content,
    creator:{
      name:'Furkan'
    },
  })
  post.save()
    .then(result => {
      console.log('POST CREATED');
      res.status(201).json({
        message: 'Post created successfully!',
        post: result
      });

    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.updatePost = (req,res,next) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new Error('Validation is failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  
  if(req.file){
    imageUrl=req.file.path.replace("\\" ,"/");
  }
  if(!imageUrl){
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error
  }
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('Could not find post')
        error.statusCode=404;
        throw error;
      }

      if(imageUrl !== post.imageUrl){
        clearImage(post.imageUrl)
      }
      post.title = title;
      post.imageUrl= imageUrl;
      post.content = content;

      return post.save()
    })
    .then(result =>{
      res.status(200).json({message: 'Post is updated',post:result})
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.deletePost = (req,res,next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('Could not find post')
        error.statusCode=404;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId)
    })
    .then(result =>{
      console.log(result);
      res.status(200).json({ message: 'Deleted post'})
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    })
}

const clearImage = filepath =>{
  filepath = path.join(__dirname,'..',filepath);
  fs.unlink(filepath,err=>console.log(err))
}


