// import { useCreateEvtForwarder } from 'react-event-forwarder'
import React, { memo, useRef } from 'react'
import { useCreateEvtForwarder } from 'react-event-forwarder'

const FuncChild = memo(props => {
    const { thingId } = props
  
    const rerenders = useRef(0)
    const dispatchEvt = useCreateEvtForwarder(props)    
    console.log('renders: ', rerenders.current++)
  return (
    <button onClick={() => dispatchEvt('choose', thingId)}>
      Func name: {thingId} - rerenders: {rerenders.current}
    </button>
  )
})

export default FuncChild
