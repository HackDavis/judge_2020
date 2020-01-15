import React, { useState, useEffect, useCallback } from 'react';
import api from 'ParseApi';
import {StatusBar, StatusIndicator, Label, Controls, Control, Buttons, Button} from './Styles'

import VotingStatus from './VotingStatus'
import QueuesStatus from './QueuesStatus'

export default function ControlPanel(){
  const [isVotingOpen, setVotingOpen] = useState(undefined);
  const [numQueues, setNumQueues] = useState(undefined);
  const [numUsers, setNumUsers] = useState(undefined);

  const openVotingGate = useCallback(() => {
    api.setAllowVoting(true).then(() => setVotingOpen(true))
  }, [])

  const closeVotingGate = useCallback(() => {
    api.setAllowVoting(false).then(() => setVotingOpen(false))
  }, [])

  const createQueues = useCallback(() => {
    api.createAllQueues().then(() => setNumQueues(undefined))
  }, [])

  useEffect(() => {

    if (isVotingOpen === undefined) {
      api.isVotingOpen()
        .then((isVotingOpen) => {
          console.log(isVotingOpen)
          setVotingOpen(isVotingOpen);
        })
        .catch((err) => {
          alert('Failed to get voting status');
          console.error(err);
        })
    }

    if (numQueues === undefined || numUsers === undefined) {
      api.getQueueCreateStatus()
        .then(({queues, users}) => {
          setNumQueues(queues);
          setNumUsers(users);
        })
    }

  }, [isVotingOpen, numQueues, numUsers])

  return (
    <React.Fragment>

      <StatusBar>

        <StatusIndicator>
          <Label>Voting Status:</Label>
          <VotingStatus isVotingOpen={isVotingOpen}/>
        </StatusIndicator>

        <StatusIndicator>
          <Label>Queues Created:</Label>
          <QueuesStatus numQueues={numQueues} numUsers={numUsers} />
        </StatusIndicator>

      </StatusBar>

      <Controls>

        <Control>
          <Label>Open/Close Voting:</Label>
          <Buttons>
            <Button onClick={openVotingGate}>Open</Button>
            <Button onClick={closeVotingGate}>Close</Button>
          </Buttons>
        </Control>

        <Control>
          <Label>Create all queues:</Label>
          <Buttons>
            <Button onClick={createQueues}>Do it</Button>
          </Buttons>
        </Control>

      </Controls>

    </React.Fragment>
  );
}