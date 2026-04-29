<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import { getThemeTokens } from '@/theme/tokens'
import { toCssVars, toWotThemeVars } from '@/theme/bridge'

const appStore = useAppStore()
const { themeMode, themeName } = storeToRefs(appStore)

const tokens = computed(() => getThemeTokens(themeMode.value, themeName.value))
const rootStyle = computed(() => toCssVars(tokens.value))
const themeVars = computed(() => toWotThemeVars(tokens.value))
</script>

<template>
  <view class="app-theme-root" :style="rootStyle">
    <wd-config-provider :theme="themeMode" :theme-vars="themeVars">
      <KuRootView />
    </wd-config-provider>
  </view>
</template>

<style lang="scss">
.app-theme-root {
  min-height: 100%;
  background-color: var(--app-bg-page);
  color: var(--app-text-primary);
}
</style>
