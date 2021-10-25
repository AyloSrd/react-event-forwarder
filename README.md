# react-event-forwarder

> A small React library to dispatch and forward React and custom events, inspired by Svelte create-event-dispatcher

[![NPM](https://img.shields.io/npm/v/react-event-forwarder.svg)](https://www.npmjs.com/package/react-event-forwarder) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-event-forwarder
```

## Usage

```jsx
import React, { Component } from 'react'

import { useMyHook } from 'react-event-forwarder'

const Example = () => {
  const example = useMyHook()
  return (
    <div>{example}</div>
  )
}
```

## License

MIT © [AyloSrd](https://github.com/AyloSrd)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
