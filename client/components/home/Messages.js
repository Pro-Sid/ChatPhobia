import React, { useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useMessageDispatch, useMessageState } from '../../context/message';
import Message from './Message';
import { Form, Col } from 'react-bootstrap';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
const GET_MESSAGES = gql`
query getMessages($from: String!){
    getMessages(from: $from){
      uuid from to content createdAt reaction
    }
  }   
`;

const SEND_MESSAGES = gql`  
    mutation sendMessage($content: String!, $to: String!){
        sendMessage(content: $content, to: $to){
                content uuid from to createdAt reaction
    }
    }
`;

export default function Messages() {
    const { users } = useMessageState();
    const dispatch = useMessageDispatch();


    const selectedUser = users?.find(u=> u.selected === true);
    const messages = selectedUser?.messages;

    const [getMessages, {loading: messageLoading, data: messageData}] = useLazyQuery(GET_MESSAGES);

    const [sendingMessages, setSendingMessages] = useState("");

    const [getMessage, {loading: sendmessageLoading, data: sendmessageData}] = useMutation(SEND_MESSAGES,{
        // onCompleted: data=> dispatch({ type: 'SEND_USER_MESSAGES', payload:{
        //     username: selectedUser.username,
        //     message: data.sendMessage
        // }}),
        onError: err=> console.log(err)
    });


    useEffect(()=>{
        if(selectedUser && !selectedUser.messages){
            getMessages({ variables: {from: selectedUser.username }})
        }
    },[selectedUser]);

    useEffect(()=>{
        if(messageData){
            dispatch({ type: 'SET_USER_MESSAGES', payload:{
                username: selectedUser.username,
                messages: messageData.getMessages
            } })
        }
    },[messageData]);

    const messageSent=(e)=>{
        e.preventDefault();
        if(sendingMessages==="" || !selectedUser) return;
        setSendingMessages('')
        getMessage({ variables: { content: sendingMessages, to: selectedUser.username } })
    }

    let SelectedChatMarkup;
    if(!messages && !messageLoading){
        SelectedChatMarkup = <p className="text-info center-align">Select a friend</p>
    }else if(messageLoading){
        SelectedChatMarkup = <p className="text-info center-align">Loading..</p>
    }else if(messages.length > 0){
        SelectedChatMarkup = messages.map((message)=>(
            <Message key={message.uuid} message={message} />
            ))
    }else if(!messageLoading){
        SelectedChatMarkup = <p className="text-info center-align">You are now connected. Send your first message</p>
    }

    return (
        <Col className="white col-sm-10 col-md-8 p-0 m-0" style={{height: 500, borderRadius:"4px"}}>
            <div style={{height: 450, overflowY:"scroll"}}>
                {SelectedChatMarkup}
            </div>
            <div>
                <Form onSubmit={messageSent}>
                    <Form.Group className="">
                    <Form.Control 
                        type="text" 
                        style={{position: "relative"}} 
                        placeholder=" Type your message"
                        className="message-input rounded-pill grey lighten-3 border-0"
                        value={sendingMessages}
                        onChange={e=> setSendingMessages(e.target.value)}
                    />
                    </Form.Group>
                    
                </Form>
            </div>
        </Col>  
    )
}
 