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
            forwardedEvt
    if (res instanceof Promise) return res
    const asyncRes = new Promise(resolve => resolve(res))
    return asyncRes
}
