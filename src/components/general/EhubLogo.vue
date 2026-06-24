<script setup>
import { getCurrentInstance } from 'vue'
import logoSrc from '@/assets/images/ehub-logo.png'

defineProps({
  width:  { type: [Number, String], default: 182 },
  height: { type: [Number, String], default: 40 },
})

const maskId = `ehub-logo-mask-${getCurrentInstance().uid}`
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 182 40"
    :width="width"
    :height="height"
    role="img"
    aria-label="eHub"
  >
    <defs>
      <mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="182" height="40">
        <image width="182" height="40" preserveAspectRatio="xMidYMid meet" :href="logoSrc" />
      </mask>
    </defs>
    <rect width="182" height="40" fill="currentColor" :mask="`url(#${maskId})`" />
  </svg>
</template>
