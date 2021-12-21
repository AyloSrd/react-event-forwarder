# react-event-forwarder 
> A small React library to dispatch and forward React and custom events and emit values, inspired by Svelte's `createEventDispatcher` and Vue's `$emit`

[![NPM](https://img.shields.io/npm/v/react-event-forwarder.svg)](https://www.npmjs.com/package/react-event-forwarder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-event-forwarder
```

## Event-forwarding for truly independent components
Besides requiring some boilerplate code, lifting the state up in React creates a very special relation of dependence between the parent component and its/their child/ren. Because of this entanglement, changing the state, or the business logic of one component, often entails having to re-think the logic of the other.

The aim of `react-event-forwarder` is to allow child components to dispatch and emit custom events (which can carry a specific data payload), or to expose/forward React events to their direct ancestor, allowing you to get rid of state-lifting constraints and create truly independent and re-usable components while remaining faithful to the single source of truth principle.

## How it works

This library is heavily inspired by Svelte's `createEventDispatcher`, and Vue's `$emit`.
`react-event-forwarder` provides you with 3 alternatives to create an `eventForwarder`s, depending on whether you prefer working with hooks, class components, or HOCs.
It is a convention to assign the provided `eventForwarder` to a function or method and name it `forwardEvt` (except when working with the HOC, which will directly pass a prop with such name).
`forwardEvt` takes a mandatory first argument, `evt`, which is either a `string` or an `Event`, and a second optional argument `evtDetail`, that can be any kind of variable.
If you want to dispatch and forward a custom event, you shall pass a `string` representing the event name, and, if needed, and an optional payload.
`react-event-forwarder` will create a Custom Event for you (FYI, the custom event won't bubble).
You can now simply call it from the Parent, as you would with a normal event (`on`+ `EventName` in Pascal case). The payload will be stored in `event.detail`.

```jsx
//Child, consumes forwardEvt from HOC
import { withCreateEvtForwarder } from 'react-event-forwarder'

const Child = ({ forwardEvt }) => {
    return (
        <div>
            <button
                onClick={() => forwardEvt('message', {msg: 'we are sending you a message'} )}
            >
                send message
            </button>
        </div>
    )
}

export default withCreateEvtForwarder(Child)

// Parent component

const Parent = props => {
    // ...business logic of the component
    return <Child onMessage={e => console.log(e.detail.msg)} />
}

```

If you want to forward a React event, or a custom one dispatched from a direct child, just pass `eventForwarder` to the event listener: it will automatically recognize the event and expose it to the parent as it is (no additional event is created).

```jsx
//Child, consumes forwardEvt from HOC
import { withCreateEvtForwarder } from 'react-event-forwarder'

const Child = props => {
    return (
        <div>
            <input
                onInput={forwardEvt}
            />
        </div>
    )
}

export default withCreateEvtForwarder(Child)

// Parent component

const Parent = props => {
    // ...business logic of the component
    return <Child onInput={e => doStuff(e.target.value)}>
}

```

On top of this, and differently from Svelte and Vue, `react-event-forwarder`, always returns a Promise, allowing you to chain further actions and events at the complition of the event's callback.

More info on this async functionality below.

### Hook

If you are working with funcitonal components, `react-event-forwarder` the easiest way to create an event forwarder is using the `useCreateEventForwarder` hook.
This hook takes the component `props` as argument, and returns an event-forwarder function. It is good practice to name this return value `forwardEvt`.

You only need to create one `forwardEvt` function per component, which you can use to forward as many custom or React events as you like from that component.
You can then use it in handler functions, or directly call it in the JSX.
The hook needs to observe the `props` of the components, to extract the callbacks, so you have to destructure them only inside the component.

If you need to memoized it with `useCallback`, don't forget to watch for changes in `props`.

```jsx
//Child
import { useEvtForwarder } from 'react-event-forwarder'

export const Child = props => {
    const forwardEvt = useEvtForwarder(props)
    
    return (
        <div>
            <button
                onClick={() => forwardEvt('message', {msg: 'we are sending you a message'} )}
            >
                send message
            </button>
        </div>
    )
}

// Parent component

const Parent = props => {
    // ...business logic of the compoent
    return <Child onMessage={e => console.log(e.detail.msg)} />
}
```

### createEvtForwarder for class components

`react-event-forwarder` provides you with an API, `createEventForwarder`, which returns an event forwarder to be used directly in class components. 
You only need to call it inside your component and assign the return value to a method. Differently from the corresponding hook, `createEventForwarder` doesn't take any argument; the resutling `forwardEvt` function, however, works the same way.

```jsx
//Child
import { createEvtForwarder } from 'react-event-forwarder'

export default class ClassChild extends Component {
    forwardEvt = createEvtForwarder()

    render() {
        return (
            <button onClick={() => this.forwardEvt('message', {msg: 'we are sending you a message'} )}>
                Send a message
            </button>
        )
    }
}

// Parent component

class Parent extends Component {
    // ...business logic of the compoent
    render () {
        return <Child onMessage={e => this.doStuff(e.detail.msg)} />
    }
}
```


### HOC for both function and class Components

Finally, if you are working in a mixed environment, you can use the Higher Order Component `withCreateEvtForwarder`. By wrapping a Component in 
`withCreateEvtForwarder`, the former will directly receive in its props the `evtForwarder` that can be used to dispatch and forward as many events as needed.

```jsx
//Child
const Child = ({ forwardEvt }) => {
    return (
        <div>
            <button
                onClick={() => forwardEvt('message', {msg: 'we are sending you a message'} )}
            >
                send message
            </button>
        </div>
    )
}

export default withCreateEvtForwarder(Child)

// Parent component

const Parent = props => {
    // ...business logic of the compoent
    return <Child onMessage={e => console.log(e.detail.msg)} />
}

```

## Asynchronicity and event chaining

`forwardEvt` let's you know when the callback has finished running by always returning a Promise that resolves to true after the callback is executed, or to `false` if there is no callback for the handler.

This opens to the possibility of using `.then` to perform further actions independently from the Parent Component, or concatenate events.

```jsx
//Child,  using hooks

import { useState } from 'react'
import { useEvtForwarder } from 'react-event-forward'

const Child = props => {
    const forwardEvt = useEvtForwarder(props)

    return (
        <button
            onClick={() => {
                forwardEvt('message', { msg: 'yooo' })
                    .then(res => res 
                        ? forwardEvt('close')
                        : console.error('a problem ocurred')
                    )
            }}
        >
            Send
        </button>
    )
}

//Parent

export default function Parent({ things }) {
    // business logic of the parent component

  return (
      <Child 
        onClose={closeChild}
        onMessage={e => handleMessage(e.detail.msg)}
    >
  )
}
```

## License

MIT © [AyloSrd](https://github.com/AyloSrd)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
