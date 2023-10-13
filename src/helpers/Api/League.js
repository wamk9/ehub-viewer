import Api from '@/helpers/Api/Connection.js';
import router from '@/router';

let League = {
    async create(data) {
        let result = await Api.postAsync('/league', data);

        if (result.code == 200) {
            router.go();
        } else {
            console.error (result.response);
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