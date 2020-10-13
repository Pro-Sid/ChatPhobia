import React, { createContext, useReducer, useContext } from 'react';
import _ from 'lodash';

const MessageDispatchContext = createContext()
const MessageStateContext = createContext()

const messageReducer = (state, action) =>{
    const { username, messages, message, reaction } = action.payload;

    let userCopy, userIndex;   
    switch (action.type){
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload
            }

        case 'ADD_USER':
            userCopy = [...state.users, action.payload.newUser];
            return{
                ...state,
                users: userCopy
            } 
            
        
        case 'SET_USER_MESSAGES':
            
            userCopy = [...state.users];
            
            userIndex = userCopy.findIndex(u=> u.username === username);

            userCopy[userIndex] = { ...userCopy[userIndex], messages };
            return{
                ...state,
                users: userCopy
            }
        
        case 'SET_SELECTED_USER':
            userCopy = state.users.map(user=>({
                ...user,
                selected: user.username === action.payload
            }))
            return {
                ...state,
                users: userCopy
            }

        case 'SEND_USER_MESSAGES':
            userCopy = [...state.users]     
            userIndex = userCopy.findIndex(u=> u.username === username);

            let mess = userCopy[userIndex].messages ? [message, ...userCopy[userIndex].messages] : null;
         
            let arrObj = _.sortBy(mess, "createdAt")
            
            let newUser = {
                ...userCopy[userIndex],
                messages: arrObj,
                latestMessage: message
            }

            userCopy[userIndex] = newUser;

            return {
                ...state,
                users: userCopy
            } 

        case 'SEND_USER_REACTION':
            userCopy = [...state.users]     
            userIndex = userCopy.findIndex(u=> u.username === username);

            let usersCopy = {...userCopy[userIndex]}
            console.log(reaction);
            const msgIndex = usersCopy.messages?.findIndex(m => m.uuid === reaction.uuid)
            console.log("out msg");

            if(msgIndex > -1){
                console.log("in msg");
                let msgCopy = [...usersCopy.messages]
                
                msgCopy[msgIndex] = {
                    ...msgCopy[msgIndex],
                    reaction: reaction.reaction
                }

                usersCopy = {
                    ...usersCopy,
                    messages: msgCopy
                }

                userCopy[userIndex] = usersCopy
            }
            return {
                ...state,
                users: userCopy
            }
        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

export const MessageProvider = ({ children }) => {
    const [state, dispatch] = useReducer(messageReducer, {users: null})
    return(
        <MessageDispatchContext.Provider value={dispatch}>
            <MessageStateContext.Provider value={state}>
                {children}
            </MessageStateContext.Provider>
        </MessageDispatchContext.Provider>
    )
}
 
export const useMessageState = () => useContext(MessageStateContext)
export const useMessageDispatch = () => useContext(MessageDispatchContext)