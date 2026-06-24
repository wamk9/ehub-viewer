import Api from '@/helpers/communication/Connection.js';

const OrganizationEventArticle = {
    async getAll(orgRoute, eventRoute) {
        const result = await Api.getAsync(`/org/${orgRoute}/event/${eventRoute}/articles`);
        return { code: result.code, data: result.response?.message };
    },
    async show(orgRoute, eventRoute, articleSlug) {
        const result = await Api.getAsync(`/org/${orgRoute}/event/${eventRoute}/article/${articleSlug}`);
        return { code: result.code, data: result.response?.message };
    },
    async create(orgRoute, eventRoute, data) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/article`, data);
        return { code: result.code, data: result.response?.message };
    },
    async update(orgRoute, eventRoute, articleId, data) {
        const result = await Api.patchAsync(`/org/${orgRoute}/event/${eventRoute}/article/${articleId}`, data);
        return { code: result.code, data: result.response?.message };
    },
    async remove(orgRoute, eventRoute, articleId) {
        const result = await Api.deleteAsync(`/org/${orgRoute}/event/${eventRoute}/article/${articleId}`);
        return { code: result.code };
    },
    async uploadImage(orgRoute, eventRoute, base64Image) {
        const result = await Api.postAsync(`/org/${orgRoute}/event/${eventRoute}/article/image`, { image: base64Image });
        return { code: result.code, data: result.response?.message };
    },
};

export default OrganizationEventArticle;
