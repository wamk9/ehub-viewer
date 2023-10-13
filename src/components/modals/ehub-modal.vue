<template>

<div :id="id" class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="false">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{{ title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="onClosingModal"></button>
            </div>
            <div class="modal-body">
                <p>{{ text }}</p>
            </div>
            <div class="modal-footer">
                <button v-if="closeOnFooter" type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="onClosingModal">{{ closeOnFooterTitle }}</button>
                <button v-for="button in buttons" type="button" class="btn btn-primary" @click="button.action">{{ button.text }}</button>
            </div>
        </div>
    </div>
</div>

</template>

<script setup>
defineEmits([
    'closingModal',
]);
</script>

<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        showModal: {
            type: Boolean,
            default: true
        },
        buttons: {
            type: Array,
        },
        title: {
            type: String,
        },
        text: {
            type: String,
        },
        closeOnFooter: {
            type: Boolean,
            default: false
        },
        closeOnFooterTitle: {
            type: String,
            default: 'Cancelar'
        },
    },
    mounted() {
        if (this.showModal)
            this.openModal();
    },
    watch: {
        showModal(option) {
            option ? this.openModal() : this.closeModal();
        },
    },
    methods: {
        openModal() {
            let modal = new bootstrap.Modal(document.getElementById(this.id), {})
            modal.show()
        },
        closeModal() {
            let modal = new bootstrap.Modal(document.getElementById(this.id), {})
            modal.hide()
        },
        onClosingModal() {
            this.$emit('closingModal');
        }
    }
}
</script>
