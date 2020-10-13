import '../style/style.css';
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';

const REGISTER_USER = gql`
  mutation addUsers($username: String! $emailid: String! $password: String! $confirm_password: String!){
    addUsers(username: $username emailid: $emailid password: $password confirm_password: $confirm_password){
      username
      emailid
      createdAt
    }
  }
`;

const Register = ()=> {


    const history = useHistory();

    const [errors, setErrors] = useState({});

    const [registerUser, { loading }] = useMutation(REGISTER_USER, {
      update(_, __){
        history.push('/login')
      },
      onError(err){
        var flag = true;
        for(var i in err['graphQLErrors'][0].message){
          if(i == "error"){
            flag = false;
            setErrors(err['graphQLErrors'][0].message['error'])
          }
        }
        if(flag==true) setErrors(err['graphQLErrors'][0].message);
      }
    })

    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [cpass, setCpass] = useState("");

    const submitForm = e =>{
        e.preventDefault();
        registerUser({variables: {username: user, emailid: email, password: pass, confirm_password: cpass}});
    }
    return (
       
        <div className="container-fluid center-align" style={{"paddingTop": "20px"}}>
          <div className="row">
            <div className="col"></div>
            <div className="col white" style={{borderRadius:"6px"}}>
              <h3>Register</h3> <br />
              <Form onSubmit={submitForm}>
                <Form.Group>
                  <Form.Label className={errors.username && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                    { errors.username ?? 'Username'}</Form.Label>
                  <Form.Control type="text" id="username" style={{textAlign: "center"}}
                  value={user}
                  className={errors.username && 'is-invalid'}
                  onChange={(e) => setUser(e.target.value)}
                  />
                  <span className="red-text text-darken-2">
                    { errors==="username is already taken" ? errors : ""}</span>
                </Form.Group>
                <Form.Group>
                  <Form.Label className={errors.emailid && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                  { errors.emailid ?? 'Email address'}  </Form.Label>
                  <Form.Control type="email" id="emailid" style={{textAlign: "center"}} 
                   value={email}
                   className={errors.emailid && 'is-invalid'}
                   onChange={e => setEmail(e.target.value)}
                  />
                  <span className="red-text text-darken-2">
                    { errors==="emailid is already taken" ? errors : ""}</span>
                </Form.Group>
                <Form.Group>
                  <Form.Label className={errors.password && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                  { errors.password ?? 'Password'}</Form.Label>
                  <Form.Control type="password" id="password" style={{textAlign: "center"}} 
                   value={pass}
                   className={errors.password && 'is-invalid'}
                   onChange={e => setPass(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className={errors.confirm_password && 'red-text text-darken-2'} style={{"fontSize": "medium"}}>
                  { errors.confirm_password ?? 'Confirm Password'}</Form.Label>
                  <Form.Control type="password" id="cpass" style={{textAlign: "center"}} 
                   value={cpass}
                   className={errors.confirm_password && 'is-invalid'}
                   onChange={e => setCpass(e.target.value)}
                  />
                </Form.Group>
                <div className="center-align" style={{"paddingBottom": "20px"}}>
                  <Button className="btn btn-success" type="submit" disabled={loading}>
                    {loading ? 'loading...' : 'Register'}</Button>
                </div>
                <small>Already have an account? <Link to="/login">Login</Link></small>
              </Form>            
            </div>
            <div className="col"></div>
          </div>
        </div>
              
    )
}

export default Register;   