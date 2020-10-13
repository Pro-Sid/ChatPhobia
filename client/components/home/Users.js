import React, { useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Image, Col } from 'react-bootstrap';
import '../../style/style.css';
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { useMessageState, useMessageDispatch } from '../../context/message';
import '../../style/styles.css';
import classNames from 'classnames';
import image from '../../../jogu.jpeg';
import image1 from '../../../siddp.jpg';

const GET_USERS = gql`
    mutation getUsers{
        getUsers{
            username createdAt imageUrl requestFrom
            latestMessage{
                uuid to from content  
            }
      }
    }
`
const GET_ALL_USERS = gql`
    query getAllUsers{
        getAllUsers{
            username createdAt imageUrl requestFrom 
        }
    }
`

export var allUserList;

export default function Users() {

    const dispatch = useMessageDispatch();
    const { users } = useMessageState();
    const selectedUser = users?.find(u=> u.selected === true)?.username;

    const [gettingUser, { loading }] = useMutation(GET_USERS,{
        onCompleted: data => {
            dispatch({ type: 'SET_USERS', payload: data.getUsers})
        },
        onError: err => console.log(err)
    });

    const { loadings } = useQuery(GET_ALL_USERS,{
        onCompleted: data => {
            allUserList = data.getAllUsers;
        },
        onError: err => console.log(err)
    });
 
    useEffect(() => {
        gettingUser()
    }, [])

    let usersList;
    if(!users || loading) usersList = <p>Loading...</p>
    else if(users.length === 0 ) usersList = <p>No users joined</p>
    else if(users.length > 0 ){
        usersList = users.map(user=>{
            const selected = selectedUser === user.username
            let img, flag;
            if(user.username === "Sid"){
                img = image;
                flag = true;
            } 
            else if(user.username === "siddarth"){
                img = image1
                flag = true;
            }  
        return(
            <div role="button" 
            key={user.username} 
            className={
                classNames("d-flex p-2 user-div justify-content-center justify-content-md-start",{
                    'bg-white': selected,
                })
            }  
            onClick={() => dispatch({type: 'SET_SELECTED_USER', payload: user.username})}
            >
                <Image src={flag?img:
                (user.imageUrl||'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')} roundedCircle
                style={{width:50, height: 50, objectFit:'cover'}}
                />
                <div className="d-none d-md-block ml-2"> 
                    <p className="text-success p-0 m-0">{user.username}</p>
                    <p className="font-weight-light p-0 m-0">
                        {user.latestMessage ? user.latestMessage.content : "You are now connected"}
                    </p>
                </div>
            </div>
        )}) 
    } 


    return (
        <Col className="white col-sm-2 col-md-4 p-0 grey lighten-3" style={{borderRadius:"4px"}}>
           {usersList}
        </Col>

    )
}