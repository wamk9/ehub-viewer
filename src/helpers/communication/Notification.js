import Api from '@/helpers/communication/Connection.js'

const Notification = {
    async getAll() {
        const result = await Api.getAsync('/notification')
        return { code: result.code, data: result.response?.message }
    },
    async markRead(id) {
        const result = await Api.patchAsync('/notification/' + id)
        return { code: result.code }
    },
    async remove(id) {
        const result = await Api.deleteAsync('/notification/' + id)
        return { code: result.code }
    },
    async clearAll() {
        const result = await Api.deleteAsync('/notification')
        return { code: result.code }
    },
}

export default Notification
