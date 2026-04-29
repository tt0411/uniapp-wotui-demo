import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TabBarMode = 'normal' | 'floating'
export type ThemeMode = 'light' | 'dark'
export type ThemeName = 'default'

export const useAppStore = defineStore('app', () => {
  const tabBarMode = ref<TabBarMode>('normal')
  const activeTab = ref<string>('/pages/tabs/home')
  const themeMode = ref<ThemeMode>('light')
  const themeName = ref<ThemeName>('default')

  function toggleTabBarMode() {
    tabBarMode.value = tabBarMode.value === 'normal' ? 'floating' : 'normal'
  }

  function setTabBarMode(mode: TabBarMode) {
    tabBarMode.value = mode
  }

  function setActiveTab(path: string) {
    activeTab.value = path
  }

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
  }

  function toggleThemeMode() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  function setThemeName(name: ThemeName) {
    themeName.value = name
  }

  return {
    tabBarMode,
    activeTab,
    themeMode,
    themeName,
    toggleTabBarMode,
    setTabBarMode,
    setActiveTab,
    setThemeMode,
    toggleThemeMode,
    setThemeName
  }
})
