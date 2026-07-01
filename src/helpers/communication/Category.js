import Api from '@/helpers/communication/Connection.js';

const Category = {
    async getAll() {
        const result = await Api.getAsync('/category');
        return { code: result.code, data: result.response?.message };
    },
    async getSubcategories(categoryRoute) {
        const result = await Api.getAsync('/category/' + categoryRoute);
        return { code: result.code, data: result.response?.message };
    },
};

export default Category;
