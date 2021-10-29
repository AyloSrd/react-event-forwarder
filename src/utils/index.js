export function createCustomEvt(evtType, evtDetail) {
    const customEvt = new CustomEvent(evtType, {
        detail: evtDetail
    })

    return customEvt
}

export function retrieveEvtListenerName(str) {
    const evtListenerName = `on${str.charAt(0).toUpperCase()}${str.slice(1)}`
    return evtListenerName
  }