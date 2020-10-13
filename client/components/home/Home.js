import React, {Fragment, useEffect} from 'react';
import { useAuthState, useAuthDispatch } from '../../context/auth';
import { useMessageDispatch, useMessageState } from '../../context/message';
import { useHistory } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { gql, useSubscription } from '@apollo/client';
import '../../style/style.css';
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Users from './Users';
import Messages from './Messages';


const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid to from content createdAt
        }
    }
`;

const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid reaction to from 
        }
    }
`;

const Home = () => {
    
    const authdispatch = useAuthDispatch();
    const messagedispatch = useMessageDispatch();
    const { users } = useMessageState();
    const { user } = useAuthState();
    const history = useHistory();

    const{ data: messageData, error: messageError } = useSubscription(NEW_MESSAGE);

    const{ data: reactionData, error: reactionError } = useSubscription(NEW_REACTION);

    useEffect(()=>{
        if(messageError) console.log(messageError);
        if(messageData){
            const message = messageData.newMessage;
            const otherUser = user.username === message.to ? message.from : message.to
            messagedispatch({ type: 'SEND_USER_MESSAGES', payload:{
                username: otherUser,
                message
            }})
        }
    },[messageError, messageData])

    useEffect(()=>{
        if(reactionError) console.log(reactionError);
        if(reactionData){
            const reaction = reactionData.newReaction;
            const otherUser = user.username === reaction.to ? reaction.from : reaction.to
            messagedispatch({ type: 'SEND_USER_REACTION', payload:{ 
                username: otherUser,
                reaction
            }})
        }
    },[reactionError, reactionData])

    const logout = () =>{
      authdispatch({ type: 'LOGOUT' })
      window.location.href = '/';
    }
    
    const handleNotification=()=>{
        history.push('/notification');
    }
    const handleSearch=()=>{
        history.push('/search');
    }

    return(
        <Fragment>
            <Container>
                <div className="text-right">
                    <button onClick={()=>handleSearch()} style={{marginTop:"2px" ,padding:"0px", borderRadius:"8px"}}>&nbsp;Search
                        <i className="fa fa-user-friends m-1" style={{color:"black"}}></i>
                    </button> 
                    &nbsp; &nbsp;
                    <i role="button" className="fa fa-bell fa-lg" onClick={()=>handleNotification()} aria-hidden="true" style={{ marginTop:"-15px", color:"white"}}>
                        <span className="badge" style={{color:"white", marginTop:"-23px", marginLeft:"-0px"}}></span></i>
                </div>
                <Row className="pt-2">  
                    <Users />
                    <Messages />
                </Row>
                <div className="center-align">
                    <Button onClick={logout} className="btn btn-success">Logout</Button>
                </div>
            </Container>
        </Fragment>
    )
}

export default Home;