
const mongoose = require('mongoose');
const graphql = require('graphql');
const models = require('../../../models');
const User = mongoose.model('user');
const Message = mongoose.model('message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../../../config/env.json');
const { withFilter } = require('apollo-server')

module.exports={
    Query:{
        getAllUsers:{
          async resolve(_, __, { user }){
            try{
              if(!user) throw new Error(err);
              let users = await User.find({username: {$ne: user.username}}, {username:1, createdAt:1, imageUrl:1, requestFrom:1})
              return users

            }catch(err){
              let newerr = new graphql.GraphQLError(err);
              newerr.message = 'UNAUTHONTICATED';
              throw newerr;
            }
          }
        },
        login:{
            
            async resolve( _ , args ){
                try{
                let { username, password } = args;
                let err = {};

                if(username.trim() === "") err.username = "username must not be empty";
                if(password === "") err.password = "password must not be empty";

                if(Object.keys(err).length > 0) throw err;

                const user = await User.findOne({ username: username },{});

                if(!user){
                    err.username = "user not found";
                    throw err;
                }

                const correctPassword = await bcrypt.compare(password, user.password);

                if(!correctPassword){
                    err.password = "Password doesn't match";
                    throw err;
                }

                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                user.token = token;
                return user;

                }catch(err){
                let newerr = new graphql.GraphQLError(err);
                throw newerr;
                }
            }
        },
        request_send:{
          async resolve(_, args, { user, pubsub }) {
            try{
              let requestUser = args;
              if(!user) throw new Error(err);
  
              await User.updateOne({ username: requestUser.username}, {$addToSet:{ requestFrom: user.username }});
          
              await User.updateOne({ username: user.username }, {$addToSet:{ requestTo: requestUser.username }});
    
              let users = await User.findOne({ username: requestUser.username },{});
              let currUser = await User.findOne({username: user.username});

              pubsub.publish('NEW_REQUEST', {newRequest : currUser })
              return users
  
            }catch(err){
              let newerr = new graphql.GraphQLError(err);
              newerr.message = 'UNAUTHONTICATED';
              throw newerr;
            }
          }
        }
    },
    Mutation:{
        addUsers:{
            async resolve(parentValue, args) { 
                try{
                  let { username, emailid, password, confirm_password, imageUrl, requestTo, requestFrom, friends } = args;
                  let err = {};
  
                  if(username.trim() === "") err.username = "username must not be empty";
                  if(emailid.trim() === "") err.emailid = "emailid must not be empty";
                  if(password === "") err.password = "password must not be empty";
                  if(confirm_password === "") err.confirm_password = "confirm_password must not be empty";
                  if(password!=confirm_password) err.confirm_password = "passwords must be same";
            
                  if(Object.keys(err).length>0) throw err
            
                  password = await bcrypt.hash(password, 4); // encrypt the password
                  return await (new User( { username, emailid, password, confirm_password, imageUrl, requestTo, requestFrom, friends } )).save()
                }catch(err){
                  
                  let newerr = new graphql.GraphQLError(err);
                  let modarr = newerr.message.errors;
                  if(newerr.message.name === "ValidationError" && newerr.message.message=== "Validation failed"){
                    
                    for(var error in modarr) {
                      
                      newerr.message.error = error + " is already taken";
                    }
                  }
                  else{
                    for(var error in modarr) {
                      
                      newerr.message.error = "Please fill valid " + error;
                    }
                  }
                
                  throw newerr;
                }
               
              }
        },
        search:{
          async resolve(_, args, { user }) {
            try{
              let searchUser = args;
              if(!user) throw new Error(err);
              let frndz = await User.find({username: user.username}, {friends:1})
              let searchfrnd = frndz.map(i=>i.friends);
              let filterfrndz = await User.find({username: {$nin: searchfrnd[0]}}, {username:1, createdAt:1, imageUrl:1})
              let users = filterfrndz.filter(i=>i.username==searchUser.username)
    
              return users[0]
            }catch(err){
              let newerr = new graphql.GraphQLError(err);
              newerr.message = 'UNAUTHONTICATED';
              throw newerr;
            }
          }
        },
        getUsers: {
          async resolve(_,__, { user }) {
              try{
           
                if(!user) throw new Error(err);
                
                let friends = await User.find({username: user.username}, {_id:0, friends:1});
        
                let users = await User.find({ username: {$in: friends[0].friends}},{username:1, createdAt:1, imageUrl:1});
                
                const allUsersMessages = await Message.find({$or : [{to: user.username}, {from: user.username}]}).sort({createdAt:-1});
          
                users = users.map(otherUser=>{
                  const latestMessage = allUsersMessages.find(
                    (m) => m.to === otherUser.username || m.from === otherUser.username
                  )
          
                  otherUser.latestMessage = latestMessage;
                  return otherUser;
                });
                return users
              }catch(err){
                let newerr = new graphql.GraphQLError(err);
                newerr.message = 'UNAUTHONTICATED';
                throw newerr;
              }
            }
      },
      get_user:{
        async resolve(_,__, { user }) {
          try{
            if(!user) throw new Error(err);
            
            let users = await User.findOne({ username: user.username},{});
            return users
          }catch(err){
            let newerr = new graphql.GraphQLError(err);
            newerr.message = 'UNAUTHONTICATED';
            throw newerr;
          }
        }
      },
      request_accept:{
        async resolve(_, args, { user, pubsub }) {
          try{
            let requestUser = args;
        
            if(!user) throw new Error(err);

            await User.updateOne({ username: user.username}, {$pull:{ requestFrom: requestUser.username }});
            await User.updateOne({ username: user.username}, {$addToSet:{ friends: requestUser.username }});
            await User.updateOne({ username: requestUser.username }, {$pull:{ requestTo: user.username }});
            await User.updateOne({ username: requestUser.username }, {$addToSet:{ friends: user.username }});

            let users = await User.findOne({ username: requestUser.username },{});

            pubsub.publish('ACCEPT_REQUEST', {acceptRequest : users })
    
            return users

          }catch(err){
            let newerr = new graphql.GraphQLError(err);
            newerr.message = 'UNAUTHONTICATED';
            throw newerr;
          }
        }
      }
    },
    Subscription: {
      newRequest: {
        subscribe: withFilter(
          (_, __, { pubsub, user }) => {
            if (!user) throw new Error('Unauthenticated')
            return pubsub.asyncIterator('NEW_REQUEST')
          },
          ({ newRequest }, _, { user }) => {
            if (
              newRequest
            ) {
              return true
            }
            return false
          }
        ),
      },
      acceptRequest: {
        subscribe: withFilter(
          (_, __, { pubsub, user }) => {
       
            if (!user) throw new Error('Unauthenticated')
            return pubsub.asyncIterator('ACCEPT_REQUEST')
          },
          ({ acceptRequest }, _, { user }) => {
            if (
              acceptRequest
            ) {
              return true
            }
            return false
          }
        ),
      },
    }
}


  
