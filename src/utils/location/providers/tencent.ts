/**
 * 腾讯地图服务提供商实现
 * 文档：https://lbs.qq.com/service/webService/webServiceGuide/webServiceGeocoder
 *
 * 腾讯地图使用 gcj02 坐标系，与微信小程序原生 getLocation 返回的坐标系一致。
 * 使用前需在腾讯位置服务后台申请 Key。
 */

import type {
  IMapProvider,
  MapProviderConfig,
  ReverseGeocodeResult,
  ReverseGeocodeOptions,
  GeocodeResult,
  Coordinate,
  CoordType,
} from '../types'

/** 腾讯地图 API 基础地址 */
const TENCENT_API_BASE = 'https://apis.map.qq.com/ws'

export class TencentMapProvider implements IMapProvider {
  readonly name = 'tencent'
  private config: MapProviderConfig

  constructor(config: MapProviderConfig) {
    if (!config.key) {
      console.error('[TencentMapProvider] 缺少腾讯地图 API Key，相关功能将不可用')
    }
    this.config = {
      coordType: 'gcj02',
      ...config,
    }
  }

  /**
   * 逆地理编码：坐标 -> 地址
   * 文档：https://lbs.qq.com/service/webService/webServiceGuide/webServiceGeocoder
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    options: ReverseGeocodeOptions = {}
  ): Promise<ReverseGeocodeResult> {
    const { getPoi = false } = options

    const params: Record<string, string | number> = {
      key: this.config.key,
      location: `${lat},${lng}`,
      get_poi: getPoi ? 1 : 0,
      output: 'json',
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${TENCENT_API_BASE}/geocoder/v1/?${queryStr}`
    console.log('[TencentMapProvider] 逆地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0) {
        console.error('[TencentMapProvider] 逆地理编码失败:', data.message)
        throw new Error(data.message || '逆地理编码失败')
      }

      const result = data.result
      const component = result.address_component || {}

      const geocodeResult: ReverseGeocodeResult = {
        address: result.address || '',
        formattedAddress: result.formatted_addresses?.recommend || result.address || '',
        province: component.province || '',
        city: component.city || '',
        district: component.district || '',
        street: component.street || '',
        streetNumber: component.street_number || '',
        adCode: String(result.ad_info?.adcode || ''),
        cityCode: String(result.ad_info?.city_code || ''),
      }

      // 解析 POI 列表
      if (getPoi && result.pois && result.pois.length > 0) {
        geocodeResult.pois = result.pois.map((poi: any) => ({
          name: poi.title || '',
          address: poi.address || '',
          latitude: poi.location?.lat || 0,
          longitude: poi.location?.lng || 0,
          distance: poi._distance ? Number(poi._distance) : undefined,
        }))
      }

      return geocodeResult
    } catch (error) {
      console.error('[TencentMapProvider] 逆地理编码请求异常:', error)
      return { address: '' }
    }
  }

  /**
   * 地理编码：地址 -> 坐标
   * 文档：https://lbs.qq.com/service/webService/webServiceGuide/webServiceGeocoder
   */
  async geocode(address: string, city?: string): Promise<GeocodeResult> {
    const params: Record<string, string> = {
      key: this.config.key,
      address,
      output: 'json',
    }
    if (city) {
      params.region = city
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${TENCENT_API_BASE}/geocoder/v1/?${queryStr}`
    console.log('[TencentMapProvider] 地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0) {
        console.error('[TencentMapProvider] 地理编码失败:', data.message)
        throw new Error(data.message || '地理编码失败')
      }

      const location = data.result.location
      return {
        latitude: location.lat,
        longitude: location.lng,
        confidence: data.result.reliability, // 腾讯返回可靠性
      }
    } catch (error) {
      console.error('[TencentMapProvider] 地理编码请求异常:', error)
      throw error
    }
  }

  /**
   * 坐标转换
   * 文档：https://lbs.qq.com/service/webService/webServiceGuide/webServiceCoordinate
   */
  async convertCoord(
    lat: number,
    lng: number,
    from: CoordType
  ): Promise<Coordinate> {
    if (from === 'gcj02') {
      return { latitude: lat, longitude: lng }
    }

    const typeMap: Record<string, number> = {
      wgs84: 1,
      bd09ll: 3, // 百度
    }
    const type = typeMap[from]
    if (!type) {
      console.error(`[TencentMapProvider] 不支持的坐标系转换: ${from}`)
      return { latitude: lat, longitude: lng }
    }

    const url = `${TENCENT_API_BASE}/coord/v1/translate?locations=${lat},${lng}&type=${type}&key=${this.config.key}`
    console.log('[TencentMapProvider] 坐标转换请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0 || !data.locations || data.locations.length === 0) {
        console.error('[TencentMapProvider] 坐标转换失败:', data.message)
        return { latitude: lat, longitude: lng }
      }

      return {
        latitude: data.locations[0].lat,
        longitude: data.locations[0].lng,
      }
    } catch (error) {
      console.error('[TencentMapProvider] 坐标转换请求异常:', error)
      return { latitude: lat, longitude: lng }
    }
  }
}
