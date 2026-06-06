import Api from '@/helpers/communication/Connection.js';

const Tournament = {
    async create(leagueRoute, data) {
        const result = await Api.postAsync('/league/' + leagueRoute + '/tournament', data);
        if (result.code === 200 || result.code === 201) return { created: true };
        return { created: false, errors: result.response?.errors, message: result.response?.message, code: result.code };
    },
    async getTournaments(leagueRoute, filter) {
        const params = filter ? '?' + new URLSearchParams(filter).toString() : '';
        const result = await Api.getAsync('/league/' + leagueRoute + '/tournament' + params);
        return { code: result.code, data: result.response?.message };
    },
    async getPeriods(leagueRoute) {
        const result = await Api.getAsync('/league/' + leagueRoute + '/tournament/periods');
        return { code: result.code, data: result.response?.message };
    },
    async getDetails(leagueRoute, tournamentRoute) {
        const result = await Api.getAsync('/league/' + leagueRoute + '/tournament/' + tournamentRoute);
        return { code: result.code, data: result.response?.message };
    },
    async updateProfile(leagueRoute, tournamentRoute, data) {
        const result = await Api.patchAsync('/league/' + leagueRoute + '/tournament/' + tournamentRoute, data);
        return { code: result.code, data: result.response?.message };
    },
    async getAllCategories() {
        const result = await Api.getAsync('/category');
        return { code: result.code, data: result.response?.message };
    },
    async getSubcategories(categoryRoute) {
        const result = await Api.getAsync('/category/' + categoryRoute);
        return { code: result.code, data: result.response?.message };
    },
    async search(params) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        const result = await Api.getAsync('/tournament' + query);
        return { code: result.code, data: result.response?.message };
    },
};

export default Tournament;
