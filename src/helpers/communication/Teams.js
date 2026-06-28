import Api from '@/helpers/communication/Connection.js';

const Teams = {
    async index(params = {}) {
        const query = new URLSearchParams(params).toString();
        const result = await Api.getAsync(`/teams${query ? '?' + query : ''}`);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async myTeams() {
        const result = await Api.getAsync('/my-teams');
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async follow(teamRoute) {
        const result = await Api.postAsync(`/teams/${teamRoute}/follow`);
        return { code: result.code };
    },
    async unfollow(teamRoute) {
        const result = await Api.deleteAsync(`/teams/${teamRoute}/follow`);
        return { code: result.code };
    },
    async create(data) {
        const result = await Api.postAsync('/team', data);
        return { code: result.code, data: result.response?.team, errors: result.response?.errors, message: result.response?.message };
    },
    async getPublic(route) {
        const result = await Api.getAsync(`/teams/${route}`);
        return { code: result.code, data: result.response?.message };
    },
    async getByRoute(route) {
        const result = await Api.getAsync(`/team/route/${route}`);
        return { code: result.code, data: result.response?.message };
    },
    async getMembersView(route) {
        const result = await Api.getAsync(`/team/${route}/members-view`);
        return { code: result.code, data: result.response?.message };
    },
    async updateSettings(id, data) {
        const result = await Api.patchAsync(`/team/${id}`, data);
        return { code: result.code, data: result.response?.team, message: result.response?.message };
    },
    async updateMemberRole(teamId, memberId, role) {
        const result = await Api.patchAsync(`/team/${teamId}/member/${memberId}`, { role });
        return { code: result.code, message: result.response?.message };
    },
    async removeMember(teamId, memberId) {
        const result = await Api.deleteAsync(`/team/${teamId}/member/${memberId}`);
        return { code: result.code, message: result.response?.message };
    },
    async leaveTeam(id) {
        const result = await Api.deleteAsync(`/team/${id}/leave`);
        return { code: result.code, message: result.response?.message };
    },
    async deleteTeam(id) {
        const result = await Api.deleteAsync(`/team/${id}`);
        return { code: result.code };
    },
    async uploadLogo(id, file) {
        const fd = new FormData();
        fd.append('logo', file);
        const result = await Api.postFormAsync(`/team/${id}/upload/logo`, fd);
        return { code: result.code, data: result.response };
    },
    async removeLogo(id) {
        const result = await Api.deleteAsync(`/team/${id}/upload/logo`);
        return { code: result.code };
    },
    async uploadCover(id, file) {
        const fd = new FormData();
        fd.append('cover', file);
        const result = await Api.postFormAsync(`/team/${id}/upload/cover`, fd);
        return { code: result.code, data: result.response };
    },
    async removeCover(id) {
        const result = await Api.deleteAsync(`/team/${id}/upload/cover`);
        return { code: result.code };
    },
    async apply(teamRoute, data) {
        const result = await Api.postAsync(`/teams/${teamRoute}/apply`, data);
        return { code: result.code, message: result.response?.message };
    },
    async listApplications(teamId) {
        const result = await Api.getAsync(`/team/${teamId}/applications`);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async acceptApplication(teamId, appId) {
        const result = await Api.postAsync(`/team/${teamId}/applications/${appId}/accept`);
        return { code: result.code };
    },
    async rejectApplication(teamId, appId) {
        const result = await Api.postAsync(`/team/${teamId}/applications/${appId}/reject`);
        return { code: result.code };
    },
    async getActivities(teamId) {
        const result = await Api.getAsync(`/team/${teamId}/activities`);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async getRoles() {
        const result = await Api.getAsync('/team-roles');
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async invite(teamId, data) {
        const result = await Api.postAsync(`/team/${teamId}/invite`, data);
        return { code: result.code, message: result.response?.message };
    },
    async acceptTeamInvite(token) {
        const result = await Api.postAsync(`/team/invite/accept/${token}`);
        return { code: result.code, message: result.response?.message };
    },
};

export default Teams;
