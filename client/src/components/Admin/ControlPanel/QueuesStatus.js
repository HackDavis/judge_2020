import React from 'react'

export default function QueuesStatus({numQueues, numUsers}) {
return <h1 className="is-2"> {(numQueues === undefined ? '.' : numQueues)} / {(numUsers === undefined ? '.' : numUsers)}</h1>
}