import Api from '@/helpers/communication/Connection.js';

const OrganizationBilling = {
    async getGateways(orgRoute) {
        const result = await Api.getAsync(`/org/${orgRoute}/payment-gateways`);
        return { code: result.code, data: result.response?.message };
    },
    async connectGateway(orgRoute, gateway) {
        const result = await Api.postAsync(`/org/${orgRoute}/payment-gateway/${gateway}/connect`);
        return { code: result.code, url: result.response?.message };
    },
    async disconnectGateway(orgRoute, gateway) {
        const result = await Api.deleteAsync(`/org/${orgRoute}/payment-gateway/${gateway}`);
        return { code: result.code };
    },
    async getBilling(orgRoute) {
        const result = await Api.getAsync(`/org/${orgRoute}/billing`);
        return { code: result.code, data: result.response?.message };
    },
    async getInvoice(orgRoute, cycle) {
        const result = await Api.getAsync(`/org/${orgRoute}/billing/${cycle}`);
        return { code: result.code, data: result.response?.message };
    },
    async getStripePortal(orgRoute, returnUrl) {
        const result = await Api.postAsync(`/org/${orgRoute}/billing/stripe-portal`, { return_url: returnUrl });
        return { code: result.code, url: result.response?.message?.url };
    },
    async setupStripe(orgRoute) {
        const result = await Api.postAsync(`/org/${orgRoute}/billing/stripe-setup`);
        return { code: result.code, clientSecret: result.response?.message?.client_secret };
    },
    async confirmStripeCard(orgRoute, paymentMethodId) {
        const result = await Api.patchAsync(`/org/${orgRoute}/billing/stripe-setup`, { payment_method_id: paymentMethodId });
        return { code: result.code };
    },
};

export default OrganizationBilling;
