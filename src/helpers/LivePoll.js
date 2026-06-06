import { onMounted, onBeforeUnmount } from 'vue'

export function useLivePoll(fetchFn, intervalMs = 5000) {
    let timer = null

    function start() {
        if (timer) return
        timer = setInterval(fetchFn, intervalMs)
    }

    function stop() {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    onMounted(start)
    onBeforeUnmount(stop)

    return { start, stop }
}
