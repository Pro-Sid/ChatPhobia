const { gql } = require('apollo-server')

module.exports = gql`
  type User {
    username: String!
    emailid: String
    createdAt: String!
    token: String
    imageUrl: String
    requestFrom: [String]
    requestTo: [String]
    friends: [String]
    latestMessage: Message
  }
  type Message {
    uuid: String! 
    content: String!
    from: String!
    to: String!
    createdAt: String!
    reaction:String
  }
  type Query {
    getAllUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
    request_send(username: String!): User!
  }
  type Mutation {
    addUsers( 
      username: String!
      emailid: String!
      password: String!
      confirm_password: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
    reactToMessage(uuid: String!, reaction: String!): Message!
    search(username: String!): User
    getUsers: [User]!
    request_accept(username: String!): User!
    get_user: User!
  }
  type Subscription {
    newMessage: Message!
    newReaction: Message!
    newRequest: User!
    acceptRequest: User!
  }
`