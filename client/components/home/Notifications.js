import React, { useState, useEffect } from 'react';
import { gql, useMutation, useSubscription } from '@apollo/client';
import { Image, Col, Container, Row } from 'react-bootstrap';
import '../../style/style.css';
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";;
import { allUserList } from './Users';
import { useMessageDispatch } from '../../context/message';

const ACCEPT_USER = gql`
    mutation request_accept($username: String!){
        request_accept(username: $username){
            username imageUrl
      }
    }
`;

const GET_USER = gql`
mutation get_user{
        get_user{
            imageUrl requestFrom
        }
    }
`;

const NEW_REQUEST = gql`
    subscription newRequest{
        newRequest{
            username imageUrl
        }
    }
`;

export default function Notification() {

    const messageDispatch = useMessageDispatch();
    const [friendreq, setFriendreq] = useState([]);

    const [getUser, { loading }] = useMutation(GET_USER,{
        onCompleted: data => { 
            let filteredUser = allUserList.filter(i=> data.get_user.requestFrom.includes(i.username));            
            setFriendreq(filteredUser);
        },
        onError: err => console.log(err)
    }); 

    const{ data: requestData, error: requestError } = useSubscription(NEW_REQUEST);

    const [reqAccept, { loadings } ] = useMutation(ACCEPT_USER,{
        onCompleted: data => {
            let newUser = data.request_accept;
            let filteredUser = friendreq.filter(i=> i.username !== data.request_accept.username);
            messageDispatch({
                type: "ADD_USER",
                payload:{ newUser }
            })
            setFriendreq(filteredUser);
        },
        onError: err => console.log(err)
    });

    useEffect(() => {
        getUser()
    }, [])

    useEffect(()=>{
        if(requestError) console.log(requestError);
        if(requestData){ 
            const reqUser = requestData.newRequest;
            const list1 = [...friendreq];
            list1.push(reqUser);
            setFriendreq(list1)
        }   
    },[requestError, requestData])

    return (
        <Container style={{"paddingTop": "10px"}}>
                <Row className="justify-content-center">
                    <Col className="white col-sm-2 col-md-4 p-2 grey lighten-3" style={{borderRadius:"6px"}}>
                    {friendreq.length>0 ?
                        friendreq.map(item=>{
                            return(
                        <div key={item.username} className="p-1">
                            <Image src={ (item.imageUrl||'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')} roundedCircle
                            style={{width:50, height: 50, objectFit:'cover'}}
                            />              
                             <button className="btn btn-success" style={{marginLeft:"76px", marginTop:"16px"}} onClick={()=>reqAccept({variables:{username: item.username}})}>Accept Request</button>
                            
                            <div className="d-none d-md-block ml-1"> 
                                <p className="text-success p-0 m-0">{item.username}</p>
                            </div>       
                        </div>)
                            }) : `No New Notification`}
                    </Col>
                </Row>
        </Container>
    )
}
