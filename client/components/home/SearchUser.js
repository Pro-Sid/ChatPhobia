import React, { useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { Image, Col, Container, Row } from 'react-bootstrap';
import '../../style/style.css';
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import '../../style/styles.css';


const SEARCH_USER = gql`
    mutation search($username: String!){
        search(username: $username){
            username createdAt imageUrl
      }
    }
`;
 
const REQUESTED_USER = gql`
    query request_send($username: String!){
        request_send(username: $username){
            requestFrom 
      }
    }
`;

export default function Search() {

    const [search, setSearch] = useState("");
    const [foundUser, setFoundUser] = useState("");
    const [request, setRequest] = useState(false);

    const [searchUser, { loading }] = useMutation(SEARCH_USER,{
        onCompleted: data => {
            setFoundUser(data.search)
        },
        onError: err => console.log(err)
    });

    const [requestUser, {loadings}] = useLazyQuery(REQUESTED_USER,{
        onCompleted: data => {
            setRequest(true)
        },
        onError: err => console.log(err)
    });

    const handleSearch = () =>{
        setSearch("");
        searchUser({ variables: {username: search}});
    }

    return (
        <Container style={{"paddingTop": "30px"}}>
            <Row className="justify-content-center">
                <Col className="white col-sm-2 col-md-4 p-1 grey lighten-3" style={{borderRadius:"6px"}}>
                    <div className="form-group" onClick={()=>setFoundUser("")}>
                        <input type="text" placeholder="Search Friends" onChange={(e)=>setSearch(e.target.value)} value={search} className="form-control"/>
                    </div>
                    <div className="center-align" style={{"paddingBottom": "10px"}}>
                        <button type="button" className="btn btn-success" onClick={()=>handleSearch()}>Search</button>
                    </div>
                </Col>
            </Row>
            <Row className="justify-content-center">
            {foundUser && 
            <Col className="white col-sm-2 col-md-4 p-2 grey lighten-3" style={{borderRadius:"6px"}}>
                <div>
                    <Image src={ (foundUser.imageUrl||'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')} roundedCircle
                    style={{width:50, height: 50, objectFit:'cover'}}
                    />

                    {request ? <button className="btn btn-secondary" style={{marginLeft:"76px", marginTop:"16px"}} >Request Sent</button>
                        : <button className="btn btn-success" style={{marginLeft:"76px", marginTop:"16px"}} onClick={()=>requestUser({ variables: {username: foundUser.username}})}>Send Request</button>
                    }
                
                    
                    <div className="d-none d-md-block ml-1"> 
                        <p className="text-success p-0 m-0">{foundUser.username}</p>
                    </div>       
                </div>
            </Col>}
            </Row>
        </Container>
    )
}
