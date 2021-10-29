import evtForwarder from '../evtForwarder'

export default function useCreateEvtForwarder(props) {
    return evtForwarder.bind({props})
}