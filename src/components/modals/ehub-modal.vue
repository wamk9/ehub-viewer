<template>

    <div :id="id" class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"
        aria-hidden="false">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title justify-content-center align-items-center d-flex">
                        <span>{{ title }}</span>
                        <button class="ms-3 btn btn-primary" style="font-size: .75rem; padding: 2px 5px;"
                            v-if="enableFullScreen" @click="() => { fullScreen(true); }">
                            <font-awesome-icon :icon="['fas', 'maximize']" />
                        </button>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        @click="onClosingModal"></button>
                </div>
                <div class="modal-body" ref="body">
                    <div class="row" v-if="onFullScreen">
                        <div class="col-12 d-flex justify-content-between mb-5">
                            <img class="desktop-navbar-logo" src="/src/assets/images/ehub-logo.png" />
                            <button class="btn btn-primary" v-if="onFullScreen"
                                @click="() => { fullScreen(false); }">Exit
                                FullScreen</button>
                        </div>
                    </div>
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button v-if="closeOnFooter" type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="onClosingModal">{{ closeOnFooterTitle }}</button>
                    <button v-for="button in buttons" type="button" class="btn btn-primary" @click="button.action">{{
                        button.text }}</button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
    props: {
        id: { type: String, required: true },
        showModal: { type: Boolean, default: true },
        enableFullScreen: { type: Boolean, default: false },
        buttons: { type: Array, default: () => [] },
        title: { type: String },
        text: { type: String },
        closeOnFooter: { type: Boolean, default: false },
        closeOnFooterTitle: { type: String, default: 'Cancelar' }
    },
    emits: ['closingModal', 'update:showModal'],
    data() {
        return {
            onFullScreen: false,
            modalInstance: null
        }
    },
    mounted() {
        this.modalInstance = new bootstrap.Modal(document.getElementById(this.id), {})

        if (this.showModal) this.modalInstance.show()

        document.addEventListener("fullscreenchange", () => {
            const doc = document.fullscreenElement;

            if (!!doc) {
                doc.classList.add('fullscreen-bg');
                this.onFullScreen = true;
            } else {
                this.$refs.body.classList.remove('fullscreen-bg');
                this.onFullScreen = false;
            }
        });
    },
    computed: {
        isFullScreen() {
            return !!document.fullscreenElement;
        }
    },
    watch: {
        showModal(value) {
            if (!this.modalInstance) return
            value ? this.modalInstance.show() : this.modalInstance.hide()
        }
    },
    methods: {
        onClosingModal() {
            this.$emit('closingModal')
            this.$emit('update:showModal', false) // 🔑 keep parent in sync
        },
        fullScreen(enable) {
            const el = this.$refs.body;

            if (enable) {
                (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen).call(el);
            } else {
                (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
            }
        },
    }
}
</script>

<style>
.fullscreen-bg {
    background-color: #181818
}
</style>