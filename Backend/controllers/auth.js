const User = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const {validationResult} = require('express-validator/check')

exports.signup = (req,res,next) =>{
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation is failed, entered data is incorrect');
        error.statusCode = 422;
        error.data = errors.array()
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    

    bcrypt.hash(password,12)
        .then(hashedPassword =>{
            const user = new User({
                email:email,
                name:name,
                password:hashedPassword,
                posts:[]
            })
            return user.save()
        })
        .then(result =>{
            res.status(201).json({ message: 'User is created',user:result})
        })
        .catch(err => {
            if(!err.statusCode){
              err.statusCode = 500;
            }
            next(err);
          })
}

exports.login = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    let foundUser

    User.findOne({email:email})
        .then(user => {
            if (!user){
                const error = new Error('A user with this email could not be found!!');
                error.statusCode = 401;
                throw error;
            }
            foundUser = user;
            return bcrypt.compare(password,user.password)
        })
        .then(isEqual =>{
            if(!isEqual){
                const error = new Error('Wrong password')
                error.statusCode = 401;
                throw error
            }
            const token =jwt.sign(
            {
                email:foundUser.email,
                userId:foundUser._id.toString()
            },'somesupersecretsecret',{expiresIn:'1h'})

            res.status(200).json({ token: token, userId:foundUser._id.toString()})
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
            })
}


exports.getUserStatus = (req,res,next) =>{
    const userId = req.userId;
    User.findById(userId)
      .then( user =>{
        if (!user){
          const error = new Error('User could not be found to get user status')
          error.statusCode = 404;
          throw error
        }
  
        res.status(200).json({message: 'Status check success!!', status: user.status})
      })
      .catch(err => {
        if(!err.statusCode){
          err.statusCode = 500;
        }
        next(err);
      })
  }
  
  exports.updateUserStatus = (req,res,next) =>{
    const userId = req.userId;
    const newStatus = req.body.status;
    User.findById(userId)
      .then( user =>{
        if (!user){
          const error = new Error('User could not be found to update user status')
          error.statusCode = 404;
          throw error
        }
        user.status = newStatus;
        return user.save()
      })
      .then( result =>{
        res.status(200).json({message: 'Status update success!!', result:result })
      })
      .catch(err => {
        if(!err.statusCode){
          err.statusCode = 500;
        }
        next(err);
      })
  }
  