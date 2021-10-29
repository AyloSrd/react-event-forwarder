import FuncChild from './FuncChild'
import React, { useCallback, useState } from 'react'

export default function Parent(props) {
  const [btn, setBtn] = useState('click on one btn')

  const changeChoice = useCallback(
    e => {
      setBtn(e.detail)
    },
    []
  )

  return (
    <>
      <h1>{btn}</h1>
      {props.things.map((thing) => (
        <FuncChild
          key={thing}
          onChoose={changeChoice}
          thingId={thing}
        />
      ))}
    </>
  )
}
