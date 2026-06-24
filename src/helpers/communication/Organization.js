import Api from '@/helpers/communication/Connection.js';

const Organization = {
    async index(params = {}) {
        const qs = new URLSearchParams(params).toString();
        const result = await Api.getAsync('/orgs' + (qs ? '?' + qs : ''));
        return { code: result.code, data: result.response?.message };
    },
    async create(data) {
        const result = await Api.postAsync('/org', data);
        if (result.code === 201) return { created: true };
        return { created: false, errors: result.response?.errors, message: result.response?.message, code: result.code };
    },
    async getMine() {
        const result = await Api.getAsync('/my-orgs');
        return { code: result.code, data: result.response?.message };
    },
    async show(orgRoute) {
        const result = await Api.getAsync('/org/' + orgRoute);
        return { code: result.code, data: result.response?.message };
    },
    async updateProfile(orgRoute, data) {
        const result = await Api.patchAsync('/org/' + orgRoute + '/profile', data);
        return { code: result.code, data: result.response?.message };
    },
    async delete(orgRoute) {
        const result = await Api.deleteAsync('/org/' + orgRoute);
        return { code: result.code, data: result.response?.message };
    },
    async getMembers(orgRoute) {
        const result = await Api.getAsync('/org/' + orgRoute + '/members');
        return { code: result.code, data: result.response?.message };
    },
    async addMember(orgRoute, email, role) {
        const result = await Api.postAsync('/org/' + orgRoute + '/member', { email, role });
        return { code: result.code, data: result.response?.message };
    },
    async transferOwnership(orgRoute, email) {
        const result = await Api.postAsync('/org/' + orgRoute + '/transfer-ownership', { email });
        return { code: result.code, data: result.response?.message };
    },
    async leaveOrganization(orgRoute) {
        const result = await Api.postAsync('/org/' + orgRoute + '/leave');
        return { code: result.code, data: result.response?.message };
    },
    async acceptInvite(token) {
        const result = await Api.postAsync('/invite/accept/' + token);
        return { code: result.code, data: result.response?.message };
    },
    async getInvites(orgRoute) {
        const result = await Api.getAsync('/org/' + orgRoute + '/invites');
        return { code: result.code, data: result.response?.message };
    },
    async resendInvite(orgRoute, inviteId) {
        const result = await Api.postAsync('/org/' + orgRoute + '/invite/' + inviteId + '/resend');
        return { code: result.code, data: result.response?.message };
    },
    async removeInvite(orgRoute, inviteId) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/invite/' + inviteId);
        return { code: result.code, data: result.response?.message };
    },
    async updateMemberRole(orgRoute, userId, role) {
        const result = await Api.patchAsync('/org/' + orgRoute + '/member/' + userId, { role });
        return { code: result.code, data: result.response?.message };
    },
    async removeMember(orgRoute, userId) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/member/' + userId);
        return { code: result.code, data: result.response?.message };
    },
    async uploadLogo(orgRoute, file) {
        const fd = new FormData();
        fd.append('logo', file);
        const result = await Api.postFormAsync('/org/' + orgRoute + '/upload/logo', fd);
        return { code: result.code, data: result.response?.message };
    },
    async uploadCover(orgRoute, file) {
        const fd = new FormData();
        fd.append('cover', file);
        const result = await Api.postFormAsync('/org/' + orgRoute + '/upload/cover', fd);
        return { code: result.code, data: result.response?.message };
    },
    async removeLogo(orgRoute) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/upload/logo');
        return { code: result.code };
    },
    async removeCover(orgRoute) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/upload/cover');
        return { code: result.code };
    },
    async follow(orgRoute) {
        const result = await Api.postAsync('/org/' + orgRoute + '/follow');
        return { code: result.code };
    },
    async unfollow(orgRoute) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/follow');
        return { code: result.code };
    },
};

export default Organization;
