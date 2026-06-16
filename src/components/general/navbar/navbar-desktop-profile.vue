<template>
    <template v-if="isLogged">
        <!-- Bell / Notifications -->
        <li class="nav-item me-4 pt-2 dropdown">
            <a class="nav-link text-center p-0 position-relative textColor" href="#"
                id="notifDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon icon="bell" class="nav-icon" />
                    <span v-if="hasUnread"
                        class="position-absolute notif-dot bg-danger border border-dark rounded-circle">
                    </span>
                </div>
                <div class="nav-label textColor">{{ $t('navbar.user.logged.notifications.title') }}</div>
                <div class="active-bar"></div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end ehub-dropdown notif-panel" aria-labelledby="notifDropdown">
                <li class="px-3 py-2 d-flex align-items-center justify-content-between notif-header">
                    <span class="text-white fw-semibold" style="font-size:0.875rem">
                        {{ $t('navbar.user.logged.notifications.title') }}
                    </span>
                    <button v-if="notifications.length" @click.prevent="handleClearAll"
                        class="btn btn-link btn-sm text-muted p-0" style="font-size:0.75rem">
                        {{ $t('notification.clear_all') }}
                    </button>
                </li>
                <li><hr class="dropdown-divider border-secondary my-1"></li>

                <li v-for="notif in notifications" :key="notif.id" class="notif-item-wrap">
                    <div class="notif-item d-flex align-items-start gap-2 px-3 py-2"
                         @click="handleNotifClick(notif)" role="button">
                        <span class="notif-unread-dot flex-shrink-0 mt-1"
                              :class="{ active: !notif.read_at }"></span>
                        <div class="flex-grow-1 overflow-hidden">
                            <div class="notif-text"
                                 :class="notif.read_at ? 'text-muted' : 'text-white'">
                                {{ notifText(notif) }}
                            </div>
                            <div class="text-muted" style="font-size:0.7rem">{{ timeAgo(notif.created_at) }}</div>
                        </div>
                        <button class="notif-delete-btn flex-shrink-0"
                                @click.stop="handleDeleteNotif(notif.id)">×</button>
                    </div>
                </li>

                <li v-if="!notifications.length" class="py-3 text-center">
                    <font-awesome-icon icon="bell" class="me-2 opacity-25" />
                    <span class="text-muted small">{{ $t('notification.empty') }}</span>
                </li>
            </ul>
        </li>

        <!-- Profile dropdown -->
        <li class="nav-item me-3 pt-2 dropdown">
            <a class="nav-link text-center p-0 profile-trigger" href="#"
                id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon icon="user" class="nav-icon" />
                </div>
                <div class="nav-label textColor">{{ $t('navbar.user.logged.profile.title') }}</div>
                <div class="active-bar"></div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end ehub-dropdown" aria-labelledby="profileDropdown"
                style="min-width: 220px">

                <!-- User header -->
                <li class="px-3 py-2 d-flex align-items-center gap-2 user-header">
                    <img :src="profileImageUrl" class="rounded-circle flex-shrink-0"
                        width="40" height="40" style="object-fit:cover" alt="avatar" />
                    <div class="overflow-hidden">
                        <div class="text-white fw-semibold text-truncate" style="font-size:0.875rem">
                            {{ profileName || '—' }}
                        </div>
                        <div class="text-muted text-truncate" style="font-size:0.75rem">
                            @{{ profileUsername || '…' }}
                        </div>
                    </div>
                </li>
                <li><hr class="dropdown-divider border-secondary my-1"></li>

                <!-- Nav items -->
                <template v-for="(item, idx) in profileItems" :key="idx">
                    <li v-if="item.divider"><hr class="dropdown-divider border-secondary my-1"></li>
                    <li v-else-if="item.action === 'logout'">
                        <a class="dropdown-item logout-item" href="#" @click.prevent="handleLogout">
                            <font-awesome-icon v-if="item.faIcon" :icon="item.faIcon" class="me-2 opacity-75" />
                            {{ item.name }}
                        </a>
                    </li>
                    <li v-else>
                        <router-link class="dropdown-item" :to="item.route">
                            <font-awesome-icon v-if="item.faIcon" :icon="item.faIcon" class="me-2 opacity-75" />
                            {{ item.name }}
                        </router-link>
                    </li>
                </template>

            </ul>
        </li>
    </template>

    <!-- Not logged -->
    <template v-else>
        <li class="nav-item me-4 pt-2">
            <router-link to="/login" class="nav-link text-center p-0 text-decoration-none">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="nav-icon" />
                </div>
                <div class="nav-label textColor">{{ $t('navbar.user.unlogged.login.title') }}</div>
                <div class="active-bar"></div>
            </router-link>
        </li>
        <li class="nav-item me-3 pt-2">
            <router-link to="/register" class="nav-link text-center p-0 text-decoration-none">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon :icon="['fas', 'user-plus']" class="nav-icon" />
                </div>
                <div class="nav-label textColor">{{ $t('navbar.user.unlogged.register.title') }}</div>
                <div class="active-bar"></div>
            </router-link>
        </li>
    </template>
</template>

<script setup>
defineProps({
    loggedOptions:        { type: Array,  default: () => [] },
    unloggedOptions:      { type: Array,  default: () => [] },
    notificationEndpoint: { type: String, required: true },
    profileEndpoint:      { type: String, required: true },
})
</script>

<script>
import Auth         from '@/helpers/communication/Auth.js'
import Api          from '@/helpers/communication/Connection'
import Notification from '@/helpers/communication/Notification.js'
import store        from '@/store'
import { createSSE } from '@/helpers/communication/useLiveSSE.js'

export default {
    data() {
        return {
            profileImageUrl: 'https://placehold.co/46',
            profileName:     '',
            profileUsername: '',
            notifications:   [],
        }
    },
    computed: {
        hasUnread() {
            return this.notifications.some(n => !n.read_at)
        },
        isLogged() {
            return !!store.getters.getToken
        },
        profileItems() {
            const items = this.isLogged ? this.loggedOptions : this.unloggedOptions
            if (!this.isLogged) return items
            const result = []
            items.forEach((item, i) => {
                if (item.action === 'logout' && i > 0) result.push({ divider: true })
                result.push(item)
            })
            return result
        },
    },
    methods: {
        async handleLogout() {
            await Auth.logout()
            this.$router.push({ name: 'home' })
        },
        async loadProfileData() {
            if (!this.isLogged) return
            try {
                const result = await Api.getAsync('/user/profile')
                if (result.code === 200) {
                    const d = result.response
                    if (d.image)    this.profileImageUrl = d.image
                    if (d.name)     this.profileName     = d.name + ' ' + (d.surname ?? '')
                    if (d.username) this.profileUsername  = d.username
                }
            } catch { /* keep placeholder */ }
        },
        notifText(notif) {
            try {
                const params = notif.description ? JSON.parse(notif.description) : {}
                const result = this.$t(notif.title, params)
                // fallback: old DB records stored keys without 'notification.' prefix
                if (result === notif.title && !notif.title.startsWith('notification.')) {
                    return this.$t('notification.' + notif.title, params)
                }
                return result
            } catch {
                return notif.title
            }
        },
        timeAgo(dateStr) {
            if (!dateStr) return ''
            const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
            if (diff < 60)    return this.$t('notification.time.just_now')
            if (diff < 3600)  return this.$t('notification.time.minutes_ago', { n: Math.floor(diff / 60) })
            if (diff < 86400) return this.$t('notification.time.hours_ago',   { n: Math.floor(diff / 3600) })
            return this.$t('notification.time.days_ago', { n: Math.floor(diff / 86400) })
        },
        async handleNotifClick(notif) {
            if (!notif.read_at) {
                notif.read_at = new Date().toISOString()
                await Notification.markRead(notif.id)
            }
            if (notif.route) this.$router.push(notif.route)
        },
        async handleDeleteNotif(id) {
            await Notification.remove(id)
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
        async handleClearAll() {
            await Notification.clearAll()
            this.notifications = []
        },
    },
    mounted() {
        this.loadProfileData()
        if (this.isLogged) {
            this._notifSSE = createSSE('notifications', {}, (payload) => {
                this.notifications = Array.isArray(payload) ? payload : []
            })
            this._notifSSE.connect()
        }
    },
    beforeUnmount() {
        if (this._notifSSE) this._notifSSE.disconnect()
    },
}
</script>

<style scoped>
/* Profile trigger */
.profile-trigger { display: block; }

/* Bell */
.icon-wrap  { width: 36px; height: 24px; position: relative; }
.nav-icon   { font-size: 1.15rem; color: #fafafa; }
.nav-label  { font-size: 13px; margin-top: 2px; color: #fafafa; }
.active-bar {
    display: block; margin: 4px auto 0;
    height: 3px; width: 0; background: transparent;
    transition: width 0.3s ease, background 0.3s ease;
}
.nav-item:hover .active-bar { width: 100%; background: #6195f5; }
.nav-item:hover .nav-icon, .nav-item:hover .nav-label { color: #6195f5; }

.notif-dot {
    position: absolute; top: -2px; right: -4px;
    width: 8px; height: 8px;
}

/* Dropdown base */
.ehub-dropdown {
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    overflow: hidden;
    padding: 4px 0;
}

/* Notification panel */
.notif-panel { min-width: 300px; max-width: 340px; }
.notif-header { border-bottom: none; }
.notif-header button { background: none; border: none; cursor: pointer; }
.notif-header button:hover { color: #fff !important; }

.notif-item-wrap + .notif-item-wrap { border-top: 1px solid #2a2a2a; }
.notif-item {
    cursor: pointer;
    transition: background 0.15s;
}
.notif-item:hover { background: #2a2a2a; }

.notif-unread-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: transparent; flex-shrink: 0; margin-top: 5px;
}
.notif-unread-dot.active { background: #6195f5; }

.notif-text {
    font-size: 0.8rem;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.notif-delete-btn {
    background: none; border: none; color: #666;
    font-size: 1rem; line-height: 1; padding: 0 2px;
    cursor: pointer; transition: color 0.15s;
}
.notif-delete-btn:hover { color: #e05050; }

/* Profile dropdown */
.user-header { border-bottom: none; }
.dropdown-item {
    color: #d0d0d0;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    margin: 2px 6px;
    width: calc(100% - 12px);
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
    display: block;
}
.dropdown-item:hover { background: #2e2e2e; color: #fff; }
.logout-item { color: #e05050; }
.logout-item:hover { background: rgba(224,80,80,0.1); color: #e05050; }
</style>
