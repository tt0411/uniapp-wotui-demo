import { watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/store/app'
import { getThemeTokens, type ThemeMode, type ThemeName, type ThemeTokens } from '@/theme/tokens'

type NavigationThemePreset = 'bgCard' | 'bgPage' | 'bgPageSecondary' | 'gradientPrimaryHeader' | 'gradientInfoHeader'
type NavigationFrontColor = '#000000' | '#ffffff' | 'auto'

export interface ApplyNavigationThemeOptions {
  preset?: NavigationThemePreset
  backgroundColor?: string
  darkBackgroundColor?: string
  lightBackgroundColor?: string
  frontColor?: NavigationFrontColor
  darkFrontColor?: '#ffffff' | '#000000'
  lightFrontColor?: '#ffffff' | '#000000'
}

function resolveBackgroundColor(tokens: ThemeTokens, themeMode: ThemeMode, options: ApplyNavigationThemeOptions) {
  if (themeMode === 'dark' && options.darkBackgroundColor) return options.darkBackgroundColor
  if (themeMode === 'light' && options.lightBackgroundColor) return options.lightBackgroundColor
  if (options.backgroundColor) return options.backgroundColor

  switch (options.preset) {
    case 'bgPage':
      return tokens.bgPage
    case 'bgPageSecondary':
      return tokens.bgPageSecondary
    case 'gradientPrimaryHeader':
      return themeMode === 'dark' ? tokens.navHeaderPrimaryDark : tokens.navHeaderPrimary
    case 'gradientInfoHeader':
      return themeMode === 'dark' ? tokens.navHeaderInfoDark : tokens.navHeaderInfo
    case 'bgCard':
    default:
      return tokens.bgCard
  }
}

function resolveFrontColor(themeMode: ThemeMode, options: ApplyNavigationThemeOptions): '#000000' | '#ffffff' {
  if (themeMode === 'dark' && options.darkFrontColor) return options.darkFrontColor
  if (themeMode === 'light' && options.lightFrontColor) return options.lightFrontColor
  if (options.frontColor === '#000000' || options.frontColor === '#ffffff') return options.frontColor
  if (options.preset === 'gradientPrimaryHeader' || options.preset === 'gradientInfoHeader') return '#ffffff'
  return themeMode === 'dark' ? '#ffffff' : '#000000'
}

function setNavigationTheme(themeMode: ThemeMode, themeName: ThemeName, options: ApplyNavigationThemeOptions) {
  const tokens = getThemeTokens(themeMode, themeName)
  uni.setNavigationBarColor({
    frontColor: resolveFrontColor(themeMode, options),
    backgroundColor: resolveBackgroundColor(tokens, themeMode, options),
    animation: {
      duration: 0,
      timingFunc: 'linear'
    }
  })
}

export function applyNavigationTheme(options: ApplyNavigationThemeOptions = {}) {
  const appStore = useAppStore()

  const syncTheme = () => {
    setNavigationTheme(appStore.themeMode, appStore.themeName, options)
  }

  onShow(() => {
    syncTheme()
  })

  watch(
    () => [appStore.themeMode, appStore.themeName] as const,
    () => {
      syncTheme()
    },
    { immediate: true }
  )
}
