import Api from '@/helpers/communication/Connection.js';

const OrganizationEvent = {
    async index(orgRoute, showFinished = false) {
        const result = await Api.getAsync(`/organization/${orgRoute}/events?finished=${showFinished ? 1 : 0}`);
        return { code: result.code, data: result.response?.message };
    },
    async show(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/event/${eventRoute}`);
        return { code: result.code, data: result.response?.message };
    },
    async store(orgRoute, data) {
        const result = await Api.postAsync(`/organization/${orgRoute}/event`, data);
        if (result.code === 201) return { created: true };
        return { created: false, errors: result.response?.errors, message: result.response?.message, code: result.code };
    },
    async update(orgRoute, eventRoute, data) {
        const result = await Api.patchAsync(`/organization/${orgRoute}/event/${eventRoute}`, data);
        return { code: result.code, data: result.response?.message };
    },
    async destroy(orgRoute, eventRoute) {
        const result = await Api.deleteAsync(`/organization/${orgRoute}/event/${eventRoute}`);
        return { code: result.code, data: result.response?.message };
    },
};

export default OrganizationEvent;
