const ehubSocket = {
    connected: { value: false },
    updates:   { value: [] },
    socket:    null,
    connectRoom() {},
    leaveRoom()  {},
    mergeData(target, source) {
        if (!source || typeof source !== 'object') return target
        return { ...target, ...source }
    },
}

export default ehubSocket
