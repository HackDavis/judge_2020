import React from 'react'
import styled, { css } from 'styled-components';

export const StatusBar = styled.div`
  display: flex;
  width: 100%;
  min-height: 3em;
  padding: 0.5em;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #fafafa;
  margin: 0.5rem 0;
`

export const StatusIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
  margin: 0.5em;
  border: 1px solid #f0f0f0;
  background-color: #fff;
  border-radius: 5px;
`

export const Label = styled.label`
  padding: 0.4em;
  color: #363636;
  display: block;
  font-size: 1rem;
  font-weight: 700;
`

export const Controls = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
`

export const Control = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5em;
  margin: 0.5em;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
`

export const Buttons = styled.div`
  display: flex;
`

export const Button = (props) => 
  <button style={{margin: "0.2em"}} className="button {props.className} " {...props}>{props.children}</button>