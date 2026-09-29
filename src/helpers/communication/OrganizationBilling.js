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
    async updateFiscal(orgRoute, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/billing/fiscal`, data);
        return { code: result.code, data: result.response?.message, errors: result.response?.errors };
    },
    async payInvoice(orgRoute, cycle) {
        const result = await Api.postAsync(`/org/${orgRoute}/billing/${cycle}/pay`);
        return { code: result.code, data: result.response?.message, blocked: result.response?.billing_blocked };
    },
    async getStripePortal(orgRoute, returnUrl) {
        const result = await Api.postAsync(`/org/${orgRoute}/billing/stripe-portal`, { return_url: returnUrl });
        return { code: result.code, url: result.response?.message?.url };
    },
    async setupStripe(orgRoute) {
        const result = await Api.postAsync(`/org/${orgRoute}/billing/stripe-setup`);
        return { code: result.code, clientSecret: result.response?.message?.client_secret, publishableKey: result.response?.message?.publishable_key };
    },
    async confirmStripeCard(orgRoute, setupIntentId) {
        const result = await Api.patchAsync(`/org/${orgRoute}/billing/stripe-setup`, { setup_intent_id: setupIntentId });
        return { code: result.code, card: result.response?.card };
    },
};

export default OrganizationBilling;
