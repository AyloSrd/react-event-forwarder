import HookChild from './HookChild'
import HOCChild from './HOCChild'
import ClassChild from './ClassChild'
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
        <HookChild
          key={thing}
          onChoose={changeChoice}
          thingId={"hook" + thing}
        />
      ))}
      <HookChild
          key={"hook catch err"}
          thingId={"hook catch err"}
        />
      {props.things.map((thing) => (
        <ClassChild
          key={thing}
          onChoose={changeChoice}
          thingId={"class" + thing}
        />
      ))}
      {props.things.map((thing) => (
        <HOCChild
          key={thing}
          onChoose={changeChoice}
          thingId={"HOC" + thing}
        />
      ))}
    </>
  )
}
