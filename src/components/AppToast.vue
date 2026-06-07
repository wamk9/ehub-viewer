<template>
    <div class="toast-wrap" aria-live="polite">
        <transition-group name="toast" tag="div">
            <div
                v-for="item in toasts"
                :key="item.id"
                class="toast-item"
                :class="`toast-item--${item.type}`"
                @click="toast.remove(item.id)"
            >
                <font-awesome-icon
                    :icon="['fas', iconFor(item.type)]"
                    class="toast-item__icon"
                />
                <span class="toast-item__msg">{{ item.message }}</span>
            </div>
        </transition-group>
    </div>
</template>

<script setup>
import { toasts, toast } from '@/helpers/toast.js'

function iconFor(type) {
    if (type === 'success') return 'circle-check'
    if (type === 'error')   return 'circle-xmark'
    if (type === 'warning') return 'triangle-exclamation'
    return 'circle-info'
}
</script>

<style scoped>
.toast-wrap {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    pointer-events: none;
}

.toast-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 500;
    min-width: 240px;
    max-width: 380px;
    pointer-events: all;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
}

.toast-item--success { background: rgba(25, 135, 84, 0.92); color: #fff; }
.toast-item--error   { background: rgba(220, 53, 69, 0.92); color: #fff; }
.toast-item--warning { background: rgba(255, 193, 7, 0.92);  color: #1a1a1a; }
.toast-item--info    { background: rgba(13, 110, 253, 0.92); color: #fff; }

.toast-item__icon { flex-shrink: 0; font-size: 1rem; }
.toast-item__msg  { flex: 1; line-height: 1.35; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(30px); }
.toast-leave-to    { opacity: 0; transform: translateX(30px); }

@media (max-width: 575.98px) {
    .toast-wrap {
        bottom: 5rem;
        right: 1rem;
        left: 1rem;
    }
    .toast-item { max-width: 100%; }
}
</style>
