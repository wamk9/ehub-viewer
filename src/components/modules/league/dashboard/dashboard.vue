<script setup>
import ehubNavGroup from '@/components/inputs/ehub-nav-group.vue';
import leagueProfile from '@/components/modules/league/dashboard/league-profile.vue';
import tournamentsManagement from '@/components/modules/league/dashboard/tournaments-management.vue';
// import router from '@/router';
</script>

<template>
    <div class="row">
        <div class="col-12 col-md-4 col-lg-3">
            <ehubNavGroup 
                id="dashboard-nav"
                :buttons="dashboardNav"
                :stickyNav="true"
                :columnNav="true"
                class="mt-3"
            />
        </div>
        <div class="col-12 col-md-8 col-lg-9">
            <div id="profile" v-if="hierarchy.config.edit_league_info">
                <h2 class="mt-3 mb-4">Perfil da Liga</h2>
                <leagueProfile
                    :refersTo="refersTo"
                    v-bind:leagueData="leagueData"
                    @league-updated="(value) => $emit('league-updated', value)"
                />
            </div>

            <hr class="my-5">
            
            <div id="hierarchy" v-if="hierarchy.config.edit_league_hierarchies">
                <h2 class="mt-3 mb-4">Hierarquias da Liga</h2>
                
            </div>

            <hr class="my-5">

            <div id="tournament" v-if="hierarchy.config.edit_league_hierarchies">
                <h2 class="mt-3 mb-4">Campeonatos</h2>
                <tournamentsManagement
                    :refersTo="refersTo"
                />
            </div>

            <hr class="my-5">

            <div id="protests" v-if="hierarchy.config.edit_league_hierarchies">
                <h2 class="mt-3 mb-4">Protestos</h2>
                
            </div>

            <hr class="my-5">

        </div>
    </div>
</template>

<script>
export default {
    props: {
        refersTo: {
            type: String,
            required: true,
        },
        hierarchy: {
            type: Object,
            required: true
        },
        leagueData: {
            type: Object,
        }
    },
    data() {
        return {
            next: [{title: 'Marcas e Turismo', started: "09/11/2023", image: 'https://placehold.co/400'}, {title: 'GT3 Championship', started: "11/11/2023", image: 'https://placehold.co/400'}, {title: 'FXO Championship', started: "14/11/2023", image: 'https://placehold.co/400'}, {title: 'iRenting XPTO', started: "17/11/2023", image: 'https://placehold.co/400'}, {title: 'Joseph\'s Racing Club', started: "09/12/2023", image: 'https://placehold.co/400'}],
            inProgress: [],
            finished: [],
        }
    },
    computed: {
        dashboardNav() {
            const leagueProfileNav = {
                id: "leagueProfileNav",
                title: "Perfil da Liga",
                href: "#profile",
                scrollTo: "profile",
            };

            const leagueHierarchyNav = {
                id: "leagueHierarchyNav",
                title: "Hierarquias",
                href: "#hierarchy",
                scrollTo: "hierarchy",
            };

            const tournamentManagementNav = {
                id: "tournamentManagementNav",
                title: "Campeonatos",
                href: "#tournament",
                scrollTo: "tournament"
            };

            const protestsNav = {
                id: "protestsNav",
                title: "Protestos",
                href: "#protests",
                scrollTo: "protests"
            };

            let allNav = [];

            if (this.hierarchy.config.edit_league_info) allNav.push(leagueProfileNav);
            if (this.hierarchy.config.edit_league_hierarchies) allNav.push(leagueHierarchyNav);
            allNav.push(tournamentManagementNav);
            allNav.push(protestsNav);

            return allNav;
        },
    },
    mounted() {
        // Used to ScrollSpy with Vanilla JS
        window.addEventListener("scroll", () => {
            this.dashboardNav.forEach((nav) => {
                const elementToScroll = document.getElementById(nav.scrollTo);

                if (elementToScroll == null)
                    return;

                const scrollOffsetTop = elementToScroll.offsetTop;
                const scrollOffsetBottom = elementToScroll.offsetTop + elementToScroll.offsetHeight;

                if (window.pageYOffset >= scrollOffsetTop)
                    document.getElementById(nav.id).classList.add("active")
                if (window.pageYOffset < scrollOffsetTop || window.pageYOffset >= scrollOffsetBottom)
                    document.getElementById(nav.id).classList.remove("active");
            });
        });
    },
    methods: {
        
    },
    /*setup(props, { emit }) {
        const updatedModel = computed({  // Use computed to wrap the object
            get: () => props.leagueData,
            set: (value) => emit('update:leagueData', value),
        });
        
        return { updatedModel };
    }*/
}
</script>

<style scoped>
</style>

<style>

</style>