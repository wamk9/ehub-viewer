import Api from '@/helpers/communication/Connection.js';

const OrganizationEventRegistration = {
    async index(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/event/${eventRoute}/participants`);
        return { code: result.code, data: result.response?.message };
    },
    async manage(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/event/${eventRoute}/manage/participants`);
        return { code: result.code, data: result.response?.message };
    },
    async store(orgRoute, eventRoute, data) {
        const result = await Api.postAsync(`/organization/${orgRoute}/event/${eventRoute}/register`, data);
        if (result.code === 201) return { registered: true, data: result.response?.data };
        return { registered: false, message: result.response?.message, code: result.code };
    },
    async destroy(orgRoute, eventRoute) {
        const result = await Api.deleteAsync(`/organization/${orgRoute}/event/${eventRoute}/register`);
        return { code: result.code };
    },
    async checkPayment(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/event/${eventRoute}/register/payment-check`);
        return { code: result.code, data: result.response?.message };
    },
    async retryPayment(orgRoute, eventRoute, gateway = null) {
        const body = gateway ? { gateway } : {};
        const result = await Api.postAsync(`/organization/${orgRoute}/event/${eventRoute}/register/payment-retry`, body);
        return { code: result.code, data: result.response?.message };
    },
};

export default OrganizationEventRegistration;
