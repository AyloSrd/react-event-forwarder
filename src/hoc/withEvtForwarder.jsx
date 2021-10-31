import evtForwarder from '../evtForwarder'
import React, { Component } from 'react'

export default function withCreateEvtForwarder(El){
    return class Wrapper extends Component {
        
       forwardEvt = evtForwarder.bind(this)

        render() {
            return (
                <El 
                    {...this.props}
                    forwardEvt={this.forwardEvt}
                />
            )
        }
    }
}