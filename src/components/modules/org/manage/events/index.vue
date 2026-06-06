<script setup>
import listEvents from './list.vue';
import manageEvent from './manage.vue';
import createEvent from './create.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
</script>

<template>
    <div class="row">
        <div class="col-12">
            <createEvent :show="showCreate" :forceOption="forceOption" />
            <manageEvent :show="showEvent" :forceOption="forceOption" :event="eventToManage"
                @close="() => eventToManage = {}" />
            <listEvents :show="showList" :forceOption="forceOption" @eventSelected="(e) => { eventToManage = e }" />
        </div>
    </div>
</template>

<script>
export default {
    emits: ['close'],
    props: {
        show: { type: Boolean, required: true },
        forceOption: { type: Array, default: () => [] },
    },
    data() {
        return {
            eventToManage: {}
        }
    },
    computed: {
        showCreate() {
            return this.show && this.$route.name === 'manage-organization-events-create';
        },
        showList() {
            return this.show && (this.$route.params.eventRoute?.length ?? 0) === 0 && !this.showCreate;
        },
        showEvent() {
            return this.show && (this.$route.params.eventRoute?.length ?? 0) > 0 && !this.showCreate;
        }
    },
    methods: {
        goToManagementMenu() {
            this.$emit('close');
            this.$router.push({
                name: 'manage-organization',
                params: { orgRoute: this.$route.params.orgRoute }
            });
        }
    },
    async mounted() {
        const eventRoute = this.$route.params.eventRoute;
        if (eventRoute?.length > 0) {
            const result = await OrganizationEvent.show(
                this.$route.params.orgRoute,
                eventRoute
            );
            if (result.code === 200 && result.data) {
                this.eventToManage = result.data;
            }
        }
    },
    watch: {
        '$route.params.eventRoute': {
            async handler(newRoute) {
                if (newRoute?.length > 0) {
                    const result = await OrganizationEvent.show(
                        this.$route.params.orgRoute,
                        newRoute
                    );
                    if (result.code === 200 && result.data) {
                        this.eventToManage = result.data;
                    }
                } else {
                    this.eventToManage = {};
                }
            }
        }
    }
}
</script>

<style scoped></style>
