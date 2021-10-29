# react-event-forwarder 
> A small React library to dispatch and forward React and custom events, inspired by Svelte create-event-dispatcher

[![NPM](https://img.shields.io/npm/v/react-event-forwarder.svg)](https://www.npmjs.com/package/react-event-forwarder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-event-forwarder
```

## Event-forwarding for truly independent components


Lifting the state up in React creates a very special relation of dependency between the parent component and its/their child/ren.
This entails that often, making changes to event-related pieces of code in one component, entails changing the corresponding code in the other.

The aim of `react-event-forwarder` is to allow child components to forward React events, or custom ones, to their parents, allowing you to create truly independent and re-usable components.

## How it works

This library is heavily inspired by Svelte's `createEventDispatcher`.
`react-event-forwarder` provides you with 3 alternatives to create an `eventForwarder`s, depending on whether you prefer working with hooks, class components, or HOCs.
It is a convention to assign the provided `eventForwarder` to a function or method and name it `forwardEvt` (except when working with the HOC, which will directly pass a prop with such name).
`forwardEvt` takes a mandatory first argument, `evt`, which is either a `string` or an `Event`, and a second optional argument `evtDetail`, that can be any kind of variable.
If you want to dispatch and forward a custom event, you shall pass a `string` representing the event name, and, if needed, and an optional payload.
`react-event-forwarder` will create a Custom Event for you (FYI, the custom event won't bubble).
You can now simply call it from the Parent, as you would with a normal event (`on`+ `EventName` in Pascal case), and get the payload from `event.detail`.

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

If you want to forward a React event, or a custom one forwarded from a direct child, just pass `eventForwarder` to the event listener: it will automatically recognize the event and make it available to the parent as it is (no additional event is created).

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

On top of this, and differently from Svelte, `react-event-forwarder`, always returns a Promise, allowing you to chain further actions and events at the complition of the event's callback.

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
import { useCreateEvtForwarder } from 'react-event-forwarder'

export const Child = props => {
    const forwardEvt = useCreateEvtForwarder(props)
    
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

When a forwarded event is fired, the event forwarded will execute the callback function, take the callbacks return value and check wheather it's a promise or not. 
If the value is a Promise, it will directly return it, otherwhise it will return a Promise resolved with the callback's return value.

This opens the possibility of waiting for the callback to be executed in order to perform further actions independently from the Parent Component, or concatenate events. This may come in useful in all situtaion wher you usually would have to pass additional props such as `isLoading`, or when the component needs to act upon a piece of information that its Parent doesn't necessarily store.

In the exemple below, the LoadTitle Component will fetch the title of a movie of the Star Wars Saga (we'll be using [SWAPI](https://swapi.dev/) for the calls) change its state accordingly, delete itself.

```jsx
//Child,  using hooks

import { useState } from 'react'
import { useCreateEvtForwarder } from './lib'

const LoadTitle = props => {
    const { order } = props
    const forwardEvt = useCreateEvtForwarder(props)
    const [txt, setTxt] = useState(`Load the ${ film }th movie`)

    const confirm = () => {
        setTxt('Loading...')
        return forwardEvt('confirm', { film })
    }

    const close = async (res) => {
        const { title } = await res.json()
        setTxt(`You loaded ${title}. Bye!`)
        setTimeout(() => forwardEvt('close', { film, title }), 2000)
    }    

    const handleError = err => {
        console.error(err)
        setTxt(`We couldn't load the ${ film }th movie :/ Try again later!`)
    }

    return (
        <div>
            <h2>{txt}</h2>
            <button
                onClick={
                    () => confirm()
                            .then(close)
                            .catch(handleError)
                }
            >
                Load
            </button>
            
        </div>
    )
}

//Parent

export default function Parent({ things }) {
  const [btn, setBtn] = useState('click on one btn')
  const [additionalState, setAdditionalState] = useState('yooo')
  const [films, setFilms] = useState(['4', '5', '6'])
  const [loadedMovies, setLoadedMovies] = useState([])

  const changeChoice = useCallback(
      (e) => {
          setBtn(e.detail)
      },
      [],
  )

    const handleConfirm = ({detail: { film } }) => fetch(`https://swapi.dev/api/films/${film}/`)

    const handleRemoveFilm = ({ detail: { film, title } }) => {
        setLoadedMovies([...loadedMovies, title])
        setFilms([...films].filter(f => f !== film))    
    }

  const fetchAdresses = useCallback(e => fetch(e.detail), [])

  return (
    <>
        <h1>Star Wars Saga</h1>
        <h2>you have loaded {loadedMovies.length} movies : </h2>
        <h2>
            <ul>
            {loadedMovies.map(movie => <li>{movie}</li>)}
            </ul>
        </h2>
        <br/>  
        <br/>
        {films.map(film => (
            <LoadStuff
            film={film}
            key={film}
            onClose={handleRemoveFilm}
            onConfirm={handleConfirm}
            />
        ))
        }
    </>
  )
}
```

You can of course do the async work in the Parent's callback, it will work the same; below how you should respectively refactor `close` and `handleConfirm` : 

```jsx
//Child 
const close = async (res) => {
    console.log(res)
    const { title } = await res.json()
    setTxt(`You loaded ${title}. Bye!`)
    setTimeout(() => forwardEvt('close', { film, title }), 2000)
} 
//Parent
  const handleConfirm = async ({detail: { film } }) => {
    const rres = await fetch(`https://swapi.dev/api/films/${film}/`)
    const res = await rres.json()
    return res
  } 
```

## License

MIT © [AyloSrd](https://github.com/AyloSrd)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
