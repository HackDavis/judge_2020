import React, {useState, useEffect} from 'react'
import api from '../../ParseApi'

export default function Queues() {
  const [csv, setCsv] = useState('')

  useEffect(() => {
    api.run('exportQueuesToCsv')
      .then((_csv) => {
        setCsv(_csv);
      })
  }, [csv])

  return (
    <textarea className="textarea" readOnly value={csv}/>
  )
}