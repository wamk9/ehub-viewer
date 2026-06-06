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
    <ehubModal id="remove-event-stage" :showModal="internalShow" title="Remove event stage?" :closeOnFooter="true"
        closeOnFooterTitle="No" :buttons="[{ text: 'Yes, remove it!', action: () => { RemoveStage(); } }]"
        @closingModal="() => { CloseRemove(); }">
        <p class="my-5">
            If you remove this stage, you can't recover, are you sure?
        </p>
    </ehubModal>
</template>

<script>
export default {
    props: {
        stage: {
            type: Object,
            required: true,
            default: {
                event: {
                    endpoint: 'event1'
                },
                endpoint: 'stage1',
            },
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
        this.internalShow = this.show;
    },
    beforeUnmount() {
    }
}
</script>

<style scoped></style>

<style></style>