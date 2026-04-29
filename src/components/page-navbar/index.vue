<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { getThemeTokens } from '@/theme/tokens'

type NavbarPreset = 'bgCard' | 'bgPage' | 'bgPageSecondary' | 'gradientPrimaryHeader' | 'gradientInfoHeader'

const props = withDefaults(defineProps<{
  title: string
  preset?: NavbarPreset
  leftArrow?: boolean
  homePath?: string
}>(), {
  preset: 'bgCard',
  leftArrow: true,
  homePath: '/pages/tabs/home'
})

const appStore = useAppStore()

const isGradientPreset = computed(() => {
  return props.preset === 'gradientPrimaryHeader' || props.preset === 'gradientInfoHeader'
})

const navbarStyle = computed(() => {
  const tokens = getThemeTokens(appStore.themeMode, appStore.themeName)

  const background = (() => {
    switch (props.preset) {
      case 'bgPage':
        return tokens.bgPage
      case 'bgPageSecondary':
        return tokens.bgPageSecondary
      case 'gradientPrimaryHeader':
        return tokens.gradientPrimary
      case 'gradientInfoHeader':
        return tokens.gradientInfo
      case 'bgCard':
      default:
        return tokens.bgCard
    }
  })()

  const titleColor = isGradientPreset.value ? tokens.textInverse : tokens.textPrimary
  const descColor = isGradientPreset.value ? 'rgba(255, 255, 255, 0.82)' : tokens.textSecondary

  return [
    `--wot-navbar-bg: ${isGradientPreset.value ? 'transparent' : background}`,
    `--wot-navbar-color: ${titleColor}`,
    `--wot-navbar-desc-color: ${descColor}`,
    `background: ${background}`
  ].join(';')
})

function handleBack() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({ url: props.homePath })
}
</script>

<template>
  <wd-navbar
    fixed
    placeholder
    safeAreaInsetTop
    custom-class="page-navbar"
    :custom-style="navbarStyle"
    :title="title"
    :left-arrow="leftArrow"
    :bordered="!isGradientPreset"
    @click-left="handleBack"
  />
</template>

<style scoped lang="scss">
:deep(.page-navbar.is-border)::after {
  border-color: var(--app-border-primary);
}
</style>
