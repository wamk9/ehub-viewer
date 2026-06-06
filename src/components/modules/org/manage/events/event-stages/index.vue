<script setup>
import eventStagesList from './list.vue';
</script>

<template>
    <div class="row" v-if="show">
        <div class="col-12">
            <eventStagesList :event="eventData" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        event: {
            type: Object,
            default: () => ({})
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            internalShow: false,
            eventData: {}
        }
    },
    computed: {
    },
    methods: {
        getOptionActivation(optkey) {
            const optionObj = this.options.find(o => Object.keys(o)[0].toLowerCase() === optkey.toLowerCase());
            if (!optionObj) return false;
            const key = Object.keys(optionObj)[0];
            return optionObj[key].active;
        },
        getOptionAction(index) {
            return Object.keys(this.options[index])[0];
        },
        resetOptionActivation() {
            this.options.forEach(o => {
                const key = Object.keys(o)[0];
                o[key].active = false;
            });
        },
        goToOption(action, needsRoute) {
            this.options = this.options.map(optionObj => {
                const key = Object.keys(optionObj)[0];
                const value = optionObj[key];
                return {
                    [key]: {
                        ...value,
                        active: action.toLowerCase() === key.toLowerCase()
                    }
                };
            });

            if (needsRoute) {
                this.$router.push({
                    name: `${this.$route.name}-${action}`,
                    params: {
                        orgRoute: this.$route.params.orgRoute,
                        eventRoute: this.$route.params.eventRoute
                    }
                });

                console.log({
                    name: `${this.$route.name}-${action}`,
                    params: {
                        orgRoute: this.$route.params.orgRoute,
                        forceOption: this.forceOption
                    }
                });
            }
        },
        CloseRemove() {
            this.internalShow = false;
            this.$emit('update:show', this.internalShow);
        },
        RemoveStage() {
            // TODO: Remove Stage from event
            this.internalShow = false;
            this.$emit('update:show', this.internalShow);
        },
    },
    mounted() {
        this.eventData = { ...this.eventData, ...this.event };
    },
    beforeUnmount() {
    },
    watch: {
        event: {
            handler(newUpdates) {
                this.eventData = { ...this.eventData, ...newUpdates };
            },
            deep: true
        },
    }

}
</script>

<style scoped></style>

<style></style>