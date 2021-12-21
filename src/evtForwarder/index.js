import { createCustomEvt, retrieveEvtListenerName } from '../utils'

export default function evtForwarder(evt, evtDetail = 0) {
    const evtType = 
        typeof evt === 'string' ?
            evt 
        : 
            evt.type       
    const evtListenerName = retrieveEvtListenerName(evtType)       
    const cb = this.props[evtListenerName]
    const forwardedEvt = 
        typeof evt === 'string' ?
            createCustomEvt(evtType, evtDetail)
        :
            evt
            
    const res = 
        typeof cb === 'function' ? 
            cb(forwardedEvt)
        :
            null
    if (res instanceof Promise) return res.then(() => true)
    if (typeof cb === 'function') return new Promise(resolve => resolve(true))
    return new Promise(resolve => resolve(false))
}
