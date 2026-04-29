/**
 * 定位服务 - 统一门面层
 *
 * 设计思路：
 * 1. 「策略模式」：通过 IMapProvider 接口抽象地图服务商，支持运行时切换
 * 2. 「门面模式」：LocationService 对外提供统一 API，屏蔽底层实现差异
 * 3. 原生定位能力（uni.getLocation 等）独立于服务商，直接调用
 * 4. 逆地理编码、地理编码等功能委托给当前注册的 MapProvider
 *
 * 使用示例：
 * ```ts
 * import { locationService } from '@/utils/location'
 *
 * // 获取当前位置
 * const loc = await locationService.getCurrentLocation()
 *
 * // 获取当前位置 + 地址信息
 * const locWithAddr = await locationService.getCurrentLocation({ needAddress: true })
 *
 * // 逆地理编码
 * const addr = await locationService.reverseGeocode(39.915, 116.404)
 *
 * // 切换服务商（如切换到高德）
 * import { AmapProvider } from '@/utils/location/providers'
 * locationService.setProvider(new AmapProvider({ key: 'YOUR_AMAP_KEY' }))
 * ```
 */

import type {
  IMapProvider,
  LocationResult,
  LocationOptions,
  ReverseGeocodeResult,
  ReverseGeocodeOptions,
  GeocodeResult,
  Coordinate,
  CoordType,
} from './types'

export class LocationService {
  private provider: IMapProvider | null = null

  /**
   * 注册地图服务提供商
   * @param provider 实现了 IMapProvider 接口的服务商实例
   */
  setProvider(provider: IMapProvider): void {
    console.log(`[LocationService] 设置地图服务提供商: ${provider.name}`)
    this.provider = provider
  }

  /**
   * 获取当前地图服务提供商
   */
  getProvider(): IMapProvider | null {
    return this.provider
  }

  /**
   * 获取当前地图服务提供商（确保已注册）
   */
  private requireProvider(): IMapProvider {
    if (!this.provider) {
      throw new Error(
        '[LocationService] 未注册地图服务提供商，请先调用 setProvider() 注册'
      )
    }
    return this.provider
  }

  // ==========================================
  // 原生定位能力（不依赖地图服务商）
  // ==========================================

  /**
   * 获取当前位置（经纬度）
   * 基于 uni.getLocation，不依赖第三方地图服务商
   *
   * @param options 定位配置
   * @returns 定位结果
   */
  async getCurrentLocation(
    options: LocationOptions = {}
  ): Promise<LocationResult> {
    const {
      type = 'gcj02',
      isHighAccuracy = true,
      highAccuracyExpireTime = 3000,
      altitude = false,
      needAddress = false,
    } = options

    uni.showLoading({ title: '正在定位...' })

    try {
      const res = await this.getLocationPromise({
        type,
        altitude,
        isHighAccuracy,
        highAccuracyExpireTime,
      })

      const result: LocationResult = {
        latitude: res.latitude,
        longitude: res.longitude,
        speed: res.speed,
        accuracy: res.accuracy,
        altitude: res.altitude,
        verticalAccuracy: res.verticalAccuracy,
        horizontalAccuracy: res.horizontalAccuracy,
      }

      // 如果需要地址信息，调用逆地理编码
      if (needAddress && this.provider) {
        try {
          const addrInfo = await this.provider.reverseGeocode(
            res.latitude,
            res.longitude
          )
          result.address = addrInfo.address
          result.city = addrInfo.city
          result.district = addrInfo.district
          result.province = addrInfo.province
          result.street = addrInfo.street
          result.streetNumber = addrInfo.streetNumber
          result.cityCode = addrInfo.cityCode
          result.adCode = addrInfo.adCode
        } catch (addrError) {
          console.warn('[LocationService] 获取地址信息失败，仅返回坐标:', addrError)
        }
      }

      return result
    } catch (err: any) {
      this.handleLocationError(err)
      throw err
    } finally {
      uni.hideLoading()
    }
  }

  /**
   * 使用微信内置地图查看位置
   */
  async openLocation(
    latitude: number,
    longitude: number,
    name = '',
    address = ''
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.openLocation({
        latitude,
        longitude,
        name,
        address,
        scale: 16,
        success: () => resolve(),
        fail: (err) => {
          uni.showToast({ title: '打开地图失败', icon: 'none' })
          reject(err)
        },
      })
    })
  }

  /**
   * 选择位置（调起地图选择器）
   */
  async chooseLocation(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      uni.chooseLocation({
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name,
            address: res.address,
          })
        },
        fail: (err) => {
          if (err.errMsg?.includes('cancel')) {
            // 用户取消，静默处理
            return
          }
          uni.showToast({ title: '选择位置失败', icon: 'none' })
          reject(err)
        },
      })
    })
  }

  // ==========================================
  // 需要地图服务商支持的能力
  // ==========================================

  /**
   * 逆地理编码：坐标 -> 地址
   * 委托给当前注册的地图服务商
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    options?: ReverseGeocodeOptions
  ): Promise<ReverseGeocodeResult> {
    const provider = this.requireProvider()
    return provider.reverseGeocode(latitude, longitude, options)
  }

  /**
   * 地理编码：地址 -> 坐标
   * 委托给当前注册的地图服务商
   */
  async geocode(address: string, city?: string): Promise<GeocodeResult> {
    const provider = this.requireProvider()
    return provider.geocode(address, city)
  }

  /**
   * 坐标系转换
   * 委托给当前注册的地图服务商
   */
  async convertCoord(
    latitude: number,
    longitude: number,
    from: CoordType
  ): Promise<Coordinate> {
    const provider = this.requireProvider()
    if (!provider.convertCoord) {
      console.warn(`[LocationService] 当前服务商 ${provider.name} 不支持坐标转换`)
      return { latitude, longitude }
    }
    return provider.convertCoord(latitude, longitude, from)
  }

  // ==========================================
  // 内部工具方法
  // ==========================================

  /**
   * 封装 uni.getLocation 为 Promise
   */
  private getLocationPromise(
    options: Partial<UniApp.GetLocationOptions>
  ): Promise<UniApp.GetLocationSuccess> {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      })
    })
  }

  /**
   * 统一处理定位错误
   */
  private handleLocationError(err: any): void {
    console.error('[LocationService] 定位失败:', err)

    if (err.errCode === 2 || err.errMsg?.includes('auth')) {
      // 权限被拒绝
      uni.showModal({
        title: '提示',
        content: '请授权位置权限',
        confirmText: '去授权',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.openAppAuthorizeSetting()
          }
        },
      })
    } else if (err.errCode === 12) {
      // 系统定位服务未开启
      uni.showModal({
        title: '提示',
        content: '定位失败，请在设置中打开定位服务',
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        },
      })
    } else {
      // 其他错误
      uni.showModal({
        title: '提示',
        content: '定位失败，请重试',
        showCancel: false,
      })
    }
  }
}
