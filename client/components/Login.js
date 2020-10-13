import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useAuthDispatch } from '../context/auth';

const LOGIN_USER = gql`
  query login($username: String! $password: String!){
    login(username: $username password: $password){
      username
      emailid
      createdAt
      token
    }
  }
`;

const Login = ()=> {

    const history = useHistory();
    const [errros, setErrors] = useState({});
    const dispatch = useAuthDispatch();

    const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
      onError: (err) => setErrors(err['graphQLErrors'][0].message),
      onCompleted(data){
        dispatch({type: 'LOGIN', payload: data.login});
        window.location.href = '/';
      } 
    })

    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    
    const submitLoginForm = e =>{
        e.preventDefault();
        loginUser({variables: {username: user, password: pass}});
    }

    return (
       
        <div className="container-fluid center-align" style={{"paddingTop": "20px"}}>
          <div className="row">
            <div className="col"></div>
            <div className="col white" style={{borderRadius:"6px"}}>
              <h3>Login</h3> <br />
              <Form onSubmit={submitLoginForm}>
                <Form.Group>
                  <Form.Label className={errros.username && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                    { errros.username ?? 'Username'}</Form.Label>
                  <Form.Control type="text" id="username" style={{textAlign: "center"}}
                  value={user}
                  className={errros.username && 'is-invalid'}
                  onChange={(e) => setUser(e.target.value)}
                  />
                </Form.Group>
            
                <Form.Group>
                  <Form.Label className={errros.password && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                  { errros.password ?? 'Password'}</Form.Label>
                  <Form.Control type="password" id="password" style={{textAlign: "center"}} 
                   value={pass}
                   className={errros.password && 'is-invalid'}
                   onChange={e => setPass(e.target.value)}
                  />
                </Form.Group>
                
                <div className="center-align" style={{"paddingBottom": "20px"}}>
                  <Button className="btn btn-success" type="submit" disabled={loading}>
                    {loading ? 'loading...' : 'Login'}</Button>
                </div>
                <small>Doesn't have an account? <Link to="/register">Register</Link></small>
              </Form>            
            </div>
            <div className="col"></div>
          </div>
        </div>
              
    )
}

export default Login;