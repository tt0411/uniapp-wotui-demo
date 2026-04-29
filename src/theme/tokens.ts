export type ThemeMode = 'light' | 'dark'
export type ThemeName = 'default'

export type ThemeTokens = {
  primary: string
  primarySoft: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  danger: string
  dangerSoft: string
  info: string
  infoSoft: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string
  textPlaceholder: string
  textDisabled: string
  textBrand: string
  bgPage: string
  bgPageSecondary: string
  bgCard: string
  bgElevated: string
  bgSurfaceMuted: string
  bgInteractive: string
  bgFloat: string
  borderPrimary: string
  borderSecondary: string
  borderInverse: string
  divider: string
  shadowCard: string
  shadowFloat: string
  navbarTextColor: string
  navbarTitleFontSize: string
  navbarTitleFontWeight: string
  tabbarBg: string
  tabbarFloatingBg: string
  tabbarBorder: string
  tabbarShadow: string
  inputBg: string
  inputText: string
  inputBorder: string
  inputPlaceholder: string
  buttonPrimaryBg: string
  buttonPrimaryText: string
  buttonPrimaryDisabledBg: string
  buttonSecondaryBg: string
  buttonSecondaryText: string
  overlayDark: string
  overlayBorder: string
  overlayIcon: string
  statusPending: string
  statusShipped: string
  statusCompleted: string
  gradientPrimary: string
  gradientInfo: string
  gradientUserHeader: string
  navHeaderPrimary: string
  navHeaderPrimaryDark: string
  navHeaderInfo: string
  navHeaderInfoDark: string
}

const lightTokens: ThemeTokens = {
  primary: '#2B9939',
  primarySoft: '#F0FDF4',
  success: '#34D399',
  successSoft: '#ECFDF5',
  warning: '#FBBF24',
  warningSoft: '#FFFBEB',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',
  textPrimary: '#333333',
  textSecondary: '#999999',
  textMuted: '#999999',
  textInverse: '#FFFFFF',
  textPlaceholder: '#9CA3AF',
  textDisabled: '#C0C4CC',
  textBrand: '#2B9939',
  bgPage: '#F5F5F5',
  bgPageSecondary: '#F8F9FA',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',
  bgSurfaceMuted: '#F2F2F7',
  bgInteractive: '#F5F5F5',
  bgFloat: 'rgba(255, 255, 255, 0.95)',
  borderPrimary: 'rgba(0, 0, 0, 0.05)',
  borderSecondary: '#E5E5E5',
  borderInverse: 'rgba(255, 255, 255, 0.3)',
  divider: '#F0F0F0',
  shadowCard: '0 4rpx 16rpx rgba(0, 0, 0, 0.05)',
  shadowFloat: '0 4rpx 16rpx rgba(32, 86, 150, 0.16)',
  navbarTextColor: '#000000',
  navbarTitleFontSize: '28rpx',
  navbarTitleFontWeight: '400',
  tabbarBg: '#FFFFFF',
  tabbarFloatingBg: 'rgba(255, 255, 255, 0.95)',
  tabbarBorder: 'rgba(0, 0, 0, 0.05)',
  tabbarShadow: '0 4rpx 16rpx rgba(0, 0, 0, 0.08)',
  inputBg: '#FFFFFF',
  inputText: '#333333',
  inputBorder: '#E5E7EB',
  inputPlaceholder: '#A9ACB8FF',
  buttonPrimaryBg: '#2B9939',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryDisabledBg: '#A7DCB0',
  buttonSecondaryBg: '#F2F2F7',
  buttonSecondaryText: '#3A3A3C',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
  overlayBorder: 'rgba(255, 255, 255, 0.3)',
  overlayIcon: 'rgba(255, 255, 255, 0.8)',
  statusPending: '#FBBF24',
  statusShipped: '#3B82F6',
  statusCompleted: '#34D399',
  gradientPrimary: 'linear-gradient(135deg, #2B9939 0%, #34C759 100%)',
  gradientInfo: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  gradientUserHeader: 'linear-gradient(135deg, #2B9939 0%, #34D399 100%)',
  navHeaderPrimary: '#2B9939',
  navHeaderPrimaryDark: '#166534',
  navHeaderInfo: '#3B82F6',
  navHeaderInfoDark: '#1D4ED8'
}

const darkTokens: ThemeTokens = {
  primary: '#35B84A',
  primarySoft: 'rgba(53, 184, 74, 0.16)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.18)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.18)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.18)',
  info: '#60A5FA',
  infoSoft: 'rgba(96, 165, 250, 0.18)',
  textPrimary: '#F5F5F5',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  textPlaceholder: '#6B7280',
  textDisabled: '#6B7280',
  textBrand: '#35B84A',
  bgPage: '#111827',
  bgPageSecondary: '#0F172A',
  bgCard: '#1F2937',
  bgElevated: '#111827',
  bgSurfaceMuted: '#374151',
  bgInteractive: '#334155',
  bgFloat: 'rgba(31, 41, 55, 0.92)',
  borderPrimary: 'rgba(255, 255, 255, 0.12)',
  borderSecondary: 'rgba(255, 255, 255, 0.18)',
  borderInverse: 'rgba(255, 255, 255, 0.28)',
  divider: 'rgba(255, 255, 255, 0.08)',
  shadowCard: '0 4rpx 16rpx rgba(0, 0, 0, 0.2)',
  shadowFloat: '0 4rpx 16rpx rgba(0, 0, 0, 0.32)',
  navbarTextColor: '#FFFFFF',
  navbarTitleFontSize: '28rpx',
  navbarTitleFontWeight: '400',
  tabbarBg: '#111827',
  tabbarFloatingBg: 'rgba(31, 41, 55, 0.92)',
  tabbarBorder: 'rgba(255, 255, 255, 0.12)',
  tabbarShadow: '0 4rpx 16rpx rgba(0, 0, 0, 0.32)',
  inputBg: '#1F2937',
  inputText: '#F5F5F5',
  inputBorder: 'rgba(255, 255, 255, 0.16)',
  inputPlaceholder: '#6B7280',
  buttonPrimaryBg: '#35B84A',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryDisabledBg: 'rgba(53, 184, 74, 0.4)',
  buttonSecondaryBg: '#374151',
  buttonSecondaryText: '#F3F4F6',
  overlayDark: 'rgba(0, 0, 0, 0.55)',
  overlayBorder: 'rgba(255, 255, 255, 0.22)',
  overlayIcon: 'rgba(255, 255, 255, 0.82)',
  statusPending: '#FBBF24',
  statusShipped: '#60A5FA',
  statusCompleted: '#34D399',
  gradientPrimary: 'linear-gradient(135deg, #1F7A2D 0%, #35B84A 100%)',
  gradientInfo: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
  gradientUserHeader: 'linear-gradient(135deg, #166534 0%, #15803D 100%)',
  navHeaderPrimary: '#35B84A',
  navHeaderPrimaryDark: '#166534',
  navHeaderInfo: '#60A5FA',
  navHeaderInfoDark: '#1D4ED8'
}

export function getThemeTokens(themeMode: ThemeMode, _themeName: ThemeName = 'default'): ThemeTokens {
  return themeMode === 'dark' ? darkTokens : lightTokens
}
