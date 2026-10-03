import Api from '@/helpers/communication/Connection.js';

const OrganizationEventStage = {
    async create(orgRoute, eventRoute, data) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/stage`, data);
        return { code: result.code, data: result.response?.message };
    },
    async update(orgRoute, eventRoute, stageRoute, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}`, data);
        return { code: result.code, data: result.response?.message };
    },
    async remove(orgRoute, eventRoute, stageRoute) {
        const result = await Api.deleteAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}`);
        return { code: result.code };
    },
    async control(orgRoute, eventRoute, stageRoute, action) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/control`, { action });
        return { code: result.code, data: result.response?.message };
    },
    async setResults(orgRoute, eventRoute, stageRoute, results, publish = null) {
        const body = publish === null ? { results } : { results, publish };
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/results`, body);
        return { code: result.code, data: result.response?.message };
    },
    async generateBracket(orgRoute, eventRoute, stageRoute, mode, seeds = null, thirdPlace = false) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/bracket`, { mode, seeds: seeds || undefined, third_place: thirdPlace });
        return { code: result.code, data: result.response?.message };
    },
    async drawGroups(orgRoute, eventRoute, mode) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/groups/draw`, { mode });
        return { code: result.code, data: result.response?.message };
    },
    async decideMatch(orgRoute, eventRoute, stageRoute, matchId, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/match/${matchId}`, data);
        return { code: result.code, data: result.response?.message };
    },
    async reorder(orgRoute, eventRoute, order) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/stages/reorder`, { order });
        return { code: result.code, data: result.response?.message };
    },
    async createRound(orgRoute, eventRoute, stageRoute, data) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/round`, data);
        return { code: result.code, data: result.response?.message };
    },
    async updateRound(orgRoute, eventRoute, stageRoute, roundId, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/round/${roundId}`, data);
        return { code: result.code, data: result.response?.message };
    },
    /** Schedule, broadcast link and "on now" of one match. */
    async updateMatch(orgRoute, eventRoute, stageRoute, matchId, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/match/${matchId}/details`, data);
        return { code: result.code, data: result.response?.message };
    },
    async removeRound(orgRoute, eventRoute, stageRoute, roundId) {
        const result = await Api.deleteAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/round/${roundId}`);
        return { code: result.code, data: result.response?.message };
    },
    async controlRound(orgRoute, eventRoute, stageRoute, roundId, action) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/round/${roundId}/control`, { action });
        return { code: result.code, data: result.response?.message };
    },
};

export default OrganizationEventStage;
