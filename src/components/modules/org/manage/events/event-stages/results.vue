<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import SystemVars from '@/helpers/General/SystemVars';
import ehubMultiInputs from '@/components/inputs/ehub-multi-inputs.vue';
import ehubProfileImage from '@/components/inputs/ehub-profile-image.vue';
import ehubModal from '@/components/modals/ehub-modal.vue';
import EventBracket from '@/components/modules/event-bracket.vue';
import Whiteboard from '@/components/modules/whiteboard.vue';
</script>

<template>
    <ehubModal id="results-event-stage" :showModal="show" title="Stage results" :closeOnFooter="true"
        :enableFullScreen="true" closeOnFooterTitle="Close" @closingModal="() => { CloseResults(); }">
        <p class="my-5">
            Results
        </p>
    </ehubModal>
</template>

<script>
export default {
    props: {
        stage: {
            type: Object,
            default: null,
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            internalShow: false
        }
    },
    computed: {
    },
    methods: {
        CloseResults() {
            this.internalShow = false;
            this.$emit('update:show', this.internalShow);
        }
    },
    mounted() {
        if (!!!this.stage) {
            this.$emit('update:show', false);
            return;
        }

        //TODO: API CALL

        this.internalShow = this.show;
    },
    beforeUnmount() {
    }
}
</script>

<style scoped></style>

<style></style>