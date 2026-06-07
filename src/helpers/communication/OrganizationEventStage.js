import Api from '@/helpers/communication/Connection.js';

const OrganizationEventStage = {
    async create(orgRoute, eventRoute, data) {
        const result = await Api.postAsync(`/organization/${orgRoute}/event/${eventRoute}/stage`, data);
        return { code: result.code, data: result.response?.message };
    },
    async update(orgRoute, eventRoute, stageRoute, data) {
        const result = await Api.patchAsync(`/organization/${orgRoute}/event/${eventRoute}/stage/${stageRoute}`, data);
        return { code: result.code, data: result.response?.message };
    },
    async remove(orgRoute, eventRoute, stageRoute) {
        const result = await Api.deleteAsync(`/organization/${orgRoute}/event/${eventRoute}/stage/${stageRoute}`);
        return { code: result.code };
    },
    async control(orgRoute, eventRoute, stageRoute, action) {
        const result = await Api.patchAsync(`/organization/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/control`, { action });
        return { code: result.code, data: result.response?.message };
    },
    async setResults(orgRoute, eventRoute, stageRoute, results) {
        const result = await Api.postAsync(`/organization/${orgRoute}/event/${eventRoute}/stage/${stageRoute}/results`, { results });
        return { code: result.code };
    },
};

export default OrganizationEventStage;
