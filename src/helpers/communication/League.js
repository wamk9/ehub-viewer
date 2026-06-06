import Api from '@/helpers/communication/api-rest';

let League = {
    async create(data) {
        let result = await Api.postAsync('/league', data);

        if (result.code == 200) {
            return {
                leagueCreated: true
            };
        } else {
            return {
                leagueCreated: false,
                errors: result.response.errors,
                code: result.code
            };
        }
    },
    async updateProfile(leagueRoute, data) {
        let result = await Api.patchAsync('/league/' + leagueRoute + '/profile', data);

        return {
            code: result.code,
            data: result.response.message
        };
    },
    async getLeagueResume(data) {
        let result = await Api.getAsync('/league/' + data);

        return {
            code: result.code,
            data: result.response.message
        };
    },
}

export default League;