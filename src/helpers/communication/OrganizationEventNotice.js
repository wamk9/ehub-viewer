import Api from '@/helpers/communication/Connection.js';

const OrganizationEventNotice = {
    async index(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/org/${orgRoute}/event/${eventRoute}/notices`);
        return { code: result.code, data: result.response?.message };
    },
    async send(orgRoute, eventRoute, data) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/notices`, data);
        return { code: result.code, data: result.response?.message };
    },
};

export default OrganizationEventNotice;
