import { ref } from 'vue'

export const toasts = ref([])
let _id = 0

function add(message, type, duration = 4000) {
    const id = ++_id
    toasts.value.push({ id, message, type })
    if (duration > 0) setTimeout(() => remove(id), duration)
}

function remove(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
}

export const toast = {
    success: (msg, duration) => add(msg, 'success', duration),
    error:   (msg, duration) => add(msg, 'error',   duration),
    warning: (msg, duration) => add(msg, 'warning', duration),
    info:    (msg, duration) => add(msg, 'info',    duration),
    remove,
}
