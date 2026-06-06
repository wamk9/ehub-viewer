import Api from '@/helpers/communication/Connection.js';

const OrganizationBilling = {
    async getGateways(orgRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/payment-gateways`);
        return { code: result.code, data: result.response?.message };
    },
    async connectGateway(orgRoute, gateway) {
        const result = await Api.postAsync(`/organization/${orgRoute}/payment-gateway/${gateway}/connect`);
        return { code: result.code, url: result.response?.message };
    },
    async disconnectGateway(orgRoute, gateway) {
        const result = await Api.deleteAsync(`/organization/${orgRoute}/payment-gateway/${gateway}`);
        return { code: result.code };
    },
    async getBilling(orgRoute) {
        const result = await Api.getAsync(`/organization/${orgRoute}/billing`);
        return { code: result.code, data: result.response?.message };
    },
    async getInvoice(orgRoute, cycle) {
        const result = await Api.getAsync(`/organization/${orgRoute}/billing/${cycle}`);
        return { code: result.code, data: result.response?.message };
    },
    async setupStripe(orgRoute) {
        const result = await Api.postAsync(`/organization/${orgRoute}/billing/stripe-setup`);
        return { code: result.code, clientSecret: result.response?.message?.client_secret };
    },
    async confirmStripeCard(orgRoute, paymentMethodId) {
        const result = await Api.patchAsync(`/organization/${orgRoute}/billing/stripe-setup`, { payment_method_id: paymentMethodId });
        return { code: result.code };
    },
};

export default OrganizationBilling;
