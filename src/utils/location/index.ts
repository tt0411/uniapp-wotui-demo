/**
 * 定位模块 - 统一入口
 *
 * 架构概览：
 * ┌─────────────────────────────────────────┐
 * │           locationService               │  ← 对外统一 API（门面层）
 * │  getCurrentLocation / reverseGeocode    │
 * │  openLocation / chooseLocation / ...    │
 * ├─────────────────────────────────────────┤
 * │           IMapProvider                  │  ← 抽象接口（策略层）
 * │  reverseGeocode / geocode / convert     │
 * ├──────────────┬──────────────────────────┤
 * │ BaiduProvider│  AmapProvider │  ...     │  ← 具体实现（可扩展）
 * └──────────────┴──────────────────────────┘
 *
 * 快速上手：
 * ```ts
 * import { locationService } from '@/utils/location'
 *
 * // 获取定位
 * const loc = await locationService.getCurrentLocation()
 *
 * // 获取定位 + 地址解析
 * const locWithAddr = await locationService.getCurrentLocation({ needAddress: true })
 *
 * // 逆地理编码
 * const addr = await locationService.reverseGeocode(lat, lng)
 * ```
 *
 * 切换服务商：
 * ```ts
 * import { locationService } from '@/utils/location'
 * import { AmapProvider } from '@/utils/location/providers'
 *
 * locationService.setProvider(new AmapProvider({ key: 'YOUR_KEY' }))
 * ```
 */

import { envConfig } from '@/config/env'
import { LocationService } from './service'
import { BaiduMapProvider } from './providers/baidu'

// ==========================================
// 创建单例并注册默认服务商（百度地图）
// ==========================================

/** 定位服务单例 */
export const locationService = new LocationService()

// 注册百度地图为默认服务商
locationService.setProvider(
  new BaiduMapProvider({
    key: envConfig.baiduMapKey,
    coordType: 'gcj02', // 微信小程序 getLocation 返回的是 gcj02，传给百度逆地理编码时指明坐标系
  })
)

// ==========================================
// 导出类型和工具
// ==========================================

export { LocationService } from './service'
export { BaiduMapProvider, AmapProvider, TencentMapProvider } from './providers'
export type {
  IMapProvider,
  MapProviderConfig,
  LocationResult,
  LocationOptions,
  ReverseGeocodeResult,
  ReverseGeocodeOptions,
  GeocodeResult,
  Coordinate,
  CoordType,
} from './types'

// ==========================================
// 兼容旧 API（平滑迁移）
// ==========================================

/** @deprecated 请使用 locationService.getCurrentLocation() */
export const getCurrentLocation = locationService.getCurrentLocation.bind(locationService)

/** @deprecated 请使用 locationService.openLocation() */
export const openLocation = locationService.openLocation.bind(locationService)

/** @deprecated 请使用 locationService.chooseLocation() */
export const chooseLocation = locationService.chooseLocation.bind(locationService)

/** @deprecated 请使用 locationService.reverseGeocode() */
export const reverseGeocoding = async (
  latitude: number,
  longitude: number
): Promise<{ address: string; formattedAddresses?: string }> => {
  const result = await locationService.reverseGeocode(latitude, longitude)
  return {
    address: result.address,
    formattedAddresses: result.formattedAddress,
  }
}
