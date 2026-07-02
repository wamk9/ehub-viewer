import Api from '@/helpers/communication/Connection.js';

const Event = {
    async search(params) {
        const result = await Api.getAsync('/events', params);
        return { code: result.code, data: result.response?.message };
    },
    async feed(mode, params = {}) {
        const result = await Api.getAsync('/events', { mode, ...params });
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async feedUpcoming(params = {}) {
        const result = await Api.getAsync('/events/upcoming', params);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async feedLatest(params = {}) {
        const result = await Api.getAsync('/events/latest', params);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async feedParticipating(params = {}) {
        const result = await Api.getAsync('/events/participating', params);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async feedFollowingOrgs(params = {}) {
        const result = await Api.getAsync('/events/following-orgs', params);
        return { code: result.code, data: result.response?.message ?? [] };
    },
    async feedFollowingTeams(params = {}) {
        const result = await Api.getAsync('/events/following-teams', params);
        return { code: result.code, data: result.response?.message ?? [] };
    },
};

export default Event;
