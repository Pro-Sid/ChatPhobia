import React, {useState} from 'react';
import { useAuthState } from '../../context/auth';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip, Button, Popover } from 'react-bootstrap';
import moment from 'moment';
import { gql, useMutation } from '@apollo/client';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎', '🍦'];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid:String!, $reaction:String!){
    reactToMessage(uuid:$uuid, reaction:$reaction){
      uuid reaction
    }
  }
`

export default function Message({ message }) {

    const { user } = useAuthState();
    const sent = user.username === message.from;
    const received = !sent;
    const [showPopover, setShowPopover] = useState(false)
    let rxt;
    if(message.reaction){
     
      rxt = message.reaction;
    } 

    const [reactToMessage] = useMutation(REACT_TO_MESSAGE,{
      onError: (err) => console.log(err),
      onCompleted: (data) => setShowPopover(false)
    })

    const react = (reactEM)=>{
      console.log(`Reacting ${reactEM} to message: ${message}`);
      reactToMessage({ variables: {uuid: message.uuid, reaction: reactEM}})
    }
    const reactButton = (
      <OverlayTrigger
        trigger="click"
        placement="top"
        show={showPopover}
        onToggle={setShowPopover}
        transition={false}
        rootClose
        overlay={
          <Popover className="rounded-pill">
            <Popover.Content>
              {reactions.map(reactEM=>(
                <Button variant="link" key={reactEM} onClick={()=> react(reactEM)}>
                  {reactEM}
                </Button>
              ))}
            </Popover.Content>
          </Popover>
        }
      >
        <Button variant="link" className="px-2">
          <i className="far fa-smile"></i>
        </Button>
      </OverlayTrigger>
    )
 
    return (
      <div className={classNames("d-flex my-3", {
            'ml-auto': received,
            'flex-row-reverse': sent
        })}>
          {sent && reactButton}
        <OverlayTrigger
        placement={sent? 'right': 'left'}
        overlay={
          <Tooltip>
            {moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
          </Tooltip>
        }
        transition={false}
      >
        
            <div className={classNames('py-2 px-3 rounded-pill position-relative', {
                'bg-primary': sent,
                'grey lighten-3': received
            })}>
 
          {rxt && (
                    <div 
                    className="grey lighten-3 p1 rounded-pill"
                    style={{"position": "absolute", "right": "-10px", "bottom": "-11px"}}
                    >
                      {rxt}
                    </div>
                  )}

            <p className={classNames({
                'text-white': sent,
                'text-black': received
            })} 
            key={message.uuid}>{message.content}</p>
            
        </div>
       
      </OverlayTrigger>
      {received && reactButton}
    </div>
    )
}
