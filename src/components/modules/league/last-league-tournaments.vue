<script setup>
import ehubNavGroup from '@/components/inputs/ehub-nav-group.vue';
import tournamentList from '@/components/modules/tournament/tournaments-list.vue';
// import router from '@/router';
</script>

<template>
    <div class="row">
        <div class="col-12 col-md-4 col-lg-3">
            <ehubNavGroup 
                id="tournament-nav"
                :buttons="tournamentsNav"
                :stickyNav="true"
                :columnNav="true"
                class="mt-3"
            />
        </div>
        <div class="col-12 col-md-8 col-lg-9">
            <div id="next">
                <h2 class="mt-3 mb-4">Em breve</h2>
                <tournamentList
                    v-if="next.length"
                    :tournaments="next"
                />
                <div class="py-5 text-center" v-else>
                    <h3>Atualmente, essa liga não possui campeonatos a ocorrer...</h3>
                    <p>É responsável por essa liga? Então crie novos campeonatos <a href="#">clicando aqui</a>!</p>
                </div>
            </div>
            <hr class="my-5">
            <div id="progress">
                <h2 class="mt-3 mb-4">Em andamento</h2>
                <tournamentList
                    v-if="inProgress.length"
                    :tournaments="inProgress"
                />
                <div class="py-5 text-center" v-else>
                    <h3>Atualmente, essa liga não possui campeonatos em andamento...</h3>
                </div>
            </div>
            <hr class="my-5">
            <div id="finished">
                <h2 class="mt-3 mb-4">Finalizados</h2>
                <tournamentList
                    v-if="finished.length"
                    :tournaments="finished"
                />
                <div class="py-5 text-center" v-else>
                    <h3>Atualmente, essa liga não possui campeonatos finalizados...</h3>
                </div>
            </div>
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
    },
  data() {
    return {
        next: [{title: 'Marcas e Turismo', started: "09/11/2023", image: 'https://placehold.co/400'}, {title: 'GT3 Championship', started: "11/11/2023", image: 'https://placehold.co/400'}, {title: 'FXO Championship', started: "14/11/2023", image: 'https://placehold.co/400'}, {title: 'iRenting XPTO', started: "17/11/2023", image: 'https://placehold.co/400'}, {title: 'Joseph\'s Racing Club', started: "09/12/2023", image: 'https://placehold.co/400'}],
        inProgress: [],
        finished: [],
    }
  },
  computed: {
    tournamentsNav() {
        const nextNav = {
            id: "nextNav",
            title: "Em Breve",
            href: "#next",
            scrollTo: "next",
            active: true
        };

        const inProgressNav = {
            id: "inProgressNav",
            title: "Em andamento",
            href: "#progress",
            scrollTo: "progress"
        };

        const finishedNav = {
            id: "finishedNav",
            title: "Finalizados",
            href: "#finished",
            scrollTo: "finished"
        };

        return [ nextNav, inProgressNav, finishedNav ];
    },
  },
  mounted() {
    // Used to ScrollSpy with Vanilla JS
    window.addEventListener("scroll", () => {
        this.tournamentsNav.forEach((nav) => {
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
}
</script>

<style scoped>
</style>

<style>

</style>