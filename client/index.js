import './style/style.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Container } from 'react-bootstrap';
import { ApolloClient,InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { AuthProvider } from './context/auth';
import { MessageProvider } from './context/message';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/home/Home';
import Search from './components/home/SearchUser';
import Notification from './components/home/Notifications';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import DynamicRoute from './util/dynamicRoute';
import { setContext } from '@apollo/client/link/context';
import './style/app.scss';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import logo from '../logo.png';

let httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});


function Root(){

  return (
   
      <ApolloProvider client={client}>
         <AuthProvider> 
           <MessageProvider>
          <Router>
              <nav>
                <ul>
                  <li>
                  <a href="/" style={{fontFamily: "Open Sans", fontSize:"20px"}}>Chat-Phobia</a>
                  </li>
                  <li>
                    <Link to="/home" style={{fontFamily: "Open Sans", fontSize:"18px"}}>Home</Link>
                  </li>
                  {localStorage.getItem('token') ?
                    null
                   : 
                   <>
                      <li>
                        <Link to="/login" style={{fontFamily: "Open Sans", fontSize:"18px"}}>Login</Link>
                      </li>
                      <li>
                        <Link to="/register" style={{fontFamily: "Open Sans", fontSize:"18px"}}>Register</Link>
                      </li>
                    </>
                   }
                </ul>
              </nav>
              <Container>
                <Switch>
                  <DynamicRoute path="/home" component={Home} authenticated/>
                  <DynamicRoute path="/register" component={Register} guest/>   
                  <DynamicRoute path="/login" component={Login} guest/>      
                  <DynamicRoute path="/search" component={Search}/> 
                  <DynamicRoute path="/notification" component={Notification}/> 
                  <>
                  <div style={{marginTop: "40px"}} className="center-block text-center">
                      <img src="https://media.giphy.com/media/P2sqgk8fykRzi/giphy.gif" alt="" style={{height:"300px", width:"300px",  borderRadius:"20px"}}/>
                      <br/><br/>
                      <img src={logo} alt="" style={{height:"80px", width:"300px",  borderRadius:"20px"}}/>
                  </div>
                  </>
                </Switch>
              </Container>
          </Router>
          
          </MessageProvider>
         </AuthProvider>
         
      </ApolloProvider> 
          

  );
};


ReactDOM.render(
  <Root />,
  document.querySelector('#root')
);



