import evtForwarder from '../evtForwarder'

export default function useEvtForwarder(props) {
    return evtForwarder.bind({props})
}