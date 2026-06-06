<template>
    <template v-if="isLogged">
        <!-- Bell / Notifications -->
        <li class="nav-item me-4 pt-2 dropdown">
            <a class="nav-link text-center p-0 position-relative textColor" href="#"
                id="notifDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon icon="bell" class="nav-icon" />
                    <span v-if="hasUnread"
                        class="position-absolute notif-dot p-1 bg-danger border border-dark rounded-circle">
                    </span>
                </div>
                <div class="nav-label textColor">{{ i18n.t('navbar.user.logged.notifications.title') }}</div>
                <div class="active-bar"></div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end ehub-dropdown" aria-labelledby="notifDropdown">
                <li v-for="(item, idx) in notifications" :key="idx" class="dropdown-item-wrap">
                    <a class="dropdown-item" href="#">{{ item.title }}</a>
                </li>
                <li v-if="!notifications.length">
                    <span class="dropdown-item text-muted small py-3 text-center d-block">
                        <font-awesome-icon icon="bell" class="me-2 opacity-50" />
                        Nenhuma notificação
                    </span>
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
                <div class="nav-label textColor">{{ i18n.t('navbar.user.logged.profile.title') }}</div>
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
                <div class="nav-label textColor">{{ i18n.t('navbar.user.unlogged.login.title') }}</div>
                <div class="active-bar"></div>
            </router-link>
        </li>
        <li class="nav-item me-3 pt-2">
            <router-link to="/register" class="nav-link text-center p-0 text-decoration-none">
                <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
                    <font-awesome-icon :icon="['fas', 'user-plus']" class="nav-icon" />
                </div>
                <div class="nav-label textColor">{{ i18n.t('navbar.user.unlogged.register.title') }}</div>
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
import Auth  from '@/helpers/communication/Auth.js'
import Api   from '@/helpers/communication/Connection'
import store from '@/store'
import { i18n } from '@/helpers/i18n'

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
            // inject divider before logout
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
                const result = await Api.getAsync('/user/profile', {
                    headers: { Authorization: 'Bearer ' + store.getters.getToken }
                })
                if (result.code === 200) {
                    const d = result.response
                    if (d.image)    this.profileImageUrl = d.image
                    if (d.name)     this.profileName     = d.name + ' ' + (d.surname ?? '')
                    if (d.username) this.profileUsername  = d.username
                }
            } catch { /* keep placeholder */ }
        },
    },
    mounted() {
        this.loadProfileData()
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

.notif-dot { position: absolute; top: -2px; right: -4px; width: 8px; height: 8px; }

.nav-label-spacer {
    height: calc(13px * 1.4);
    margin-top: 2px;
}

/* Dropdown */
.ehub-dropdown {
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    overflow: hidden;
    padding: 4px 0;
}

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
