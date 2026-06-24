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
};

export default Teams;
