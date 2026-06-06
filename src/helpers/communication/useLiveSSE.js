import { onMounted, onBeforeUnmount } from 'vue'
import store from '@/store'
import SystemVars from '@/helpers/General/SystemVars'

function buildUrl(module, params) {
    const token = store.getters.getToken ?? ''
    const query = new URLSearchParams({ module, token, ...params })
    return SystemVars.baseUrlAPI + 'live?' + query.toString()
}

// Plain factory — use in Options API components (mounted / beforeUnmount)
export function createSSE(module, params, onData) {
    let es = null

    function connect() {
        if (es) { es.close(); es = null }
        es = new EventSource(buildUrl(module, params))
        es.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data)
                if (msg.type === module && msg.payload !== undefined) {
                    onData(msg.payload)
                }
            } catch {}
        }
        es.onerror = () => { /* EventSource auto-reconnects */ }
    }

    function disconnect() {
        if (es) { es.close(); es = null }
    }

    return { connect, disconnect }
}

// Composable — use in <script setup> (auto lifecycle)
export function useLiveSSE(module, params, onData) {
    const sse = createSSE(module, params, onData)
    onMounted(sse.connect)
    onBeforeUnmount(sse.disconnect)
    return sse
}
