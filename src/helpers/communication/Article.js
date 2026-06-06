import Api from '@/helpers/communication/Connection.js';

const Article = {
    async show(orgRoute, articleSlug) {
        const result = await Api.getAsync('/organization/' + orgRoute + '/article/' + articleSlug);
        return { code: result.code, data: result.response?.message };
    },
    async getAll(orgRoute) {
        const result = await Api.getAsync('/organization/' + orgRoute + '/articles');
        return { code: result.code, data: result.response?.message };
    },
    async create(orgRoute, data) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/article', data);
        return { code: result.code, data: result.response?.message };
    },
    async update(orgRoute, articleId, data) {
        const result = await Api.patchAsync('/organization/' + orgRoute + '/article/' + articleId, data);
        return { code: result.code, data: result.response?.message };
    },
    async remove(orgRoute, articleId) {
        const result = await Api.deleteAsync('/organization/' + orgRoute + '/article/' + articleId);
        return { code: result.code, data: result.response?.message };
    },
    async uploadImage(orgRoute, base64Image) {
        const result = await Api.postAsync('/organization/' + orgRoute + '/article/image', { image: base64Image });
        return { code: result.code, data: result.response?.message };
    },
};

export default Article;
