import Api from '@/helpers/communication/Connection.js';

const Article = {
    async show(orgRoute, articleSlug) {
        const result = await Api.getAsync('/org/' + orgRoute + '/article/' + articleSlug);
        return { code: result.code, data: result.response?.message };
    },
    async getAll(orgRoute) {
        const result = await Api.getAsync('/org/' + orgRoute + '/articles');
        return { code: result.code, data: result.response?.message };
    },
    async create(orgRoute, data) {
        const result = await Api.postAsync('/org/' + orgRoute + '/article', data);
        return { code: result.code, data: result.response?.message };
    },
    async update(orgRoute, articleId, data) {
        const result = await Api.patchAsync('/org/' + orgRoute + '/article/' + articleId, data);
        return { code: result.code, data: result.response?.message };
    },
    async remove(orgRoute, articleId) {
        const result = await Api.deleteAsync('/org/' + orgRoute + '/article/' + articleId);
        return { code: result.code, data: result.response?.message };
    },
    async uploadImage(orgRoute, base64Image) {
        const result = await Api.postAsync('/org/' + orgRoute + '/article/image', { image: base64Image });
        return { code: result.code, data: result.response?.message };
    },
};

export default Article;
