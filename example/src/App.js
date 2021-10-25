import React from 'react'
import { useMyHook } from 'react-event-forwarder'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App