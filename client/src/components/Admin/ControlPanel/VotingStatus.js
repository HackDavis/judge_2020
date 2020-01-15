import React from 'react';
import styled from 'styled-components';

const StatusSpan = styled.span`
  font-size: 1.2rem;
  padding: 0.2em 0.4em;
  background-color: ${props => props.statusBgColor};
  color: #fff;
`;

export default function VotingStatus({isVotingOpen}){
  if (isVotingOpen === undefined) {
    return <StatusSpan statusBgColor="#d9d9d9">...</StatusSpan>
  }

  if (isVotingOpen) {
    return <StatusSpan statusBgColor="#32cd32">Open</StatusSpan>
  }

  return <StatusSpan statusBgColor="#cc3336">Closed</StatusSpan>
}