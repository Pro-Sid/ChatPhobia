
const mongoose = require('mongoose');
const graphql = require('graphql');
const models = require('../../../models');
const User = mongoose.model('user');
const Message = mongoose.model('message');
const bcrypt = require('bcryptjs');
const { withFilter } = require('apollo-server')

module.exports={
    Query:{
        getMessages: {
            async resolve(_,{ from }, { user }) {
                try{
                  if(!user) throw new Error('UNAUTHONTICATED');
                  
                  const otherUser = await User.findOne({username: from})
                  if(!otherUser) throw new Error("User not found");
                  else if(otherUser.username === user.username) throw new Error("You can't get messages of yourself");
        
                  const messages = await Message.find({$and: [{$or:[{to: user.username}, {from:user.username}]},{$or:[{to: otherUser.username}, {from:otherUser.username}]}]}).sort({createdAt:1});
                  
                  return messages
        
                }catch(err){
                  throw err;
                }
                
              }
        },
    },
    Mutation:{
        sendMessage:{
            async resolve(parentValue, {content, to}, {user, pubsub}){
                try{
                  if(!user) throw new Error('UNAUTHONTICATED');
                  
                  const recipient = await User.findOne({username: to})
                  if(!recipient) throw new Error("User not found");
                  else if(recipient.username === user.username) throw new Error("You can't message yourself");
                  
                  if(content.trim() === "") throw new Error("Message is empty");
        
                  const msg = await (new Message( { 
                    content, 
                    from: user.username, 
                    reaction: "",
                    to } )).save()
        
                  pubsub.publish('NEW_MESSAGE', { newMessage: msg })
                      
                  return msg 
        
                }catch(err){
                  throw err;
                }
              }
        },
        reactToMessage:{
          async resolve(_, { uuid, reaction }, { user, pubsub }){
            
            const reactionEmoji = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎', '🍦'];
            try{
              if(!reactionEmoji.includes(reaction)) throw new Error('Invalid Reaction');

              const username = user ? user.username : ''
              user = await User.findOne({username});
              if(!user) throw new Error('Unauthonticated');
        
              const message = await Message.findOne({ uuid });
              if(!message) throw new Error('message not found');

              if(message.from !== user.username && message.to !== user.username) throw new Error('Unauthonticated');
             
              const rm = await Message.update({uuid}, {$set:{reaction: reaction}})

              const mess = await Message.findOne({ uuid });
              pubsub.publish('NEW_REACTION', {newReaction : mess })
              return mess
            }catch(err){
              throw err
            }
          }
        }
    },
    Subscription: {
      newMessage: {
        subscribe: withFilter(
          (_, __, { pubsub, user }) => {
            if (!user) throw new Error('Unauthenticated')
            return pubsub.asyncIterator(['NEW_MESSAGE'])
          },
          ({ newMessage }, _, { user }) => {
            if (
              newMessage.from === user.username ||
              newMessage.to === user.username
            ) {
              return true
            }
  
            return false
          }
        ),
      },
      newReaction: {
        subscribe: withFilter(
          (_, __, { pubsub, user }) => {
            if (!user) throw new Error('Unauthenticated')
            return pubsub.asyncIterator('NEW_REACTION')
          },
          async ({ newReaction }, _, { user }) => {
            if (
              newReaction.from === user.username ||
              newReaction.to === user.username
            ) {
              return true
            }
            return false
          }
        ),
      },
    },
}


  
