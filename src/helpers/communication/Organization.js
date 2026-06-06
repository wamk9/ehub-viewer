import Api from '@/helpers/communication/Connection.js';

const Organization = {
    async create(data) {
        const result = await Api.postAsync('/organization', data);
        if (result.code === 201) return { created: true };
        return { created: false, errors: result.response?.errors, message: result.response?.message, code: result.code };
    },
    async getMine() {
        const result = await Api.getAsync('/organizations/mine');
        return { code: result.code, data: result.response?.message };
    },
    async show(orgRoute) {
        const result = await Api.getAsync('/organization/' + orgRoute);
        return { code: result.code, data: result.response?.message };
    },
    async updateProfile(orgRoute, data) {
        const result = await Api.patchAsync('/organization/' + orgRoute + '/profile', data);
        return { code: result.code, data: result.response?.message };
    },
    async delete(orgRoute) {
        const result = await Api.deleteAsync('/organization/' + orgRoute);
        return { code: result.code, data: result.response?.message };
    },
    async getMembers(orgRoute) {
        const result = await Api.getAsync('/organization/' + orgRoute + '/members');
        return { code: result.code, data: result.response?.message };
    },
    async addMember(orgRoute, email, role) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/member', { email, role });
        return { code: result.code, data: result.response?.message };
    },
    async transferOwnership(orgRoute, email) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/transfer-ownership', { email });
        return { code: result.code, data: result.response?.message };
    },
    async leaveOrganization(orgRoute) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/leave');
        return { code: result.code, data: result.response?.message };
    },
    async acceptInvite(token) {
        const result = await Api.postAsync('/invite/accept/' + token);
        return { code: result.code, data: result.response?.message };
    },
    async getInvites(orgRoute) {
        const result = await Api.getAsync('/organization/' + orgRoute + '/invites');
        return { code: result.code, data: result.response?.message };
    },
    async resendInvite(orgRoute, inviteId) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/invite/' + inviteId + '/resend');
        return { code: result.code, data: result.response?.message };
    },
    async removeInvite(orgRoute, inviteId) {
        const result = await Api.deleteAsync('/organization/' + orgRoute + '/invite/' + inviteId);
        return { code: result.code, data: result.response?.message };
    },
    async updateMemberRole(orgRoute, userId, role) {
        const result = await Api.patchAsync('/organization/' + orgRoute + '/member/' + userId, { role });
        return { code: result.code, data: result.response?.message };
    },
    async removeMember(orgRoute, userId) {
        const result = await Api.deleteAsync('/organization/' + orgRoute + '/member/' + userId);
        return { code: result.code, data: result.response?.message };
    },
};

export default Organization;
