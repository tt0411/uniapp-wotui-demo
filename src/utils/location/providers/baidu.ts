/**
 * 百度地图服务提供商实现
 * 文档：https://lbsyun.baidu.com/faq/api?title=webapi
 *
 * 百度地图使用 bd09ll 坐标系，需要注意与其他坐标系的转换。
 * 接口调用建议通过后端代理，避免在小程序端直接暴露 AK。
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

/** 百度地图 API 基础地址 */
const BAIDU_API_BASE = 'https://api.map.baidu.com'

/** 百度坐标系转换类型映射 */
const COORD_TYPE_MAP: Record<string, number> = {
  wgs84: 1,   // GPS 坐标
  gcj02: 3,   // 国测局坐标
  bd09ll: 5,  // 百度坐标（无需转换）
}

export class BaiduMapProvider implements IMapProvider {
  readonly name = 'baidu'
  private config: MapProviderConfig

  constructor(config: MapProviderConfig) {
    if (!config.key) {
      console.error('[BaiduMapProvider] 缺少百度地图 API Key，逆地理编码等功能将不可用')
    }
    this.config = {
      coordType: 'bd09ll',
      ...config,
    }
  }

  /**
   * 逆地理编码：坐标 -> 地址
   * 文档：https://lbsyun.baidu.com/faq/api?title=webapi/guide/webservice-geocoding-abroad
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    options: ReverseGeocodeOptions = {}
  ): Promise<ReverseGeocodeResult> {
    const { getPoi = false, poiRadius = 1000 } = options

    const params: Record<string, string | number> = {
      ak: this.config.key,
      location: `${lat},${lng}`,
      output: 'json',
      coordtype: this.config.coordType || 'bd09ll',
    }

    if (getPoi) {
      params.extensions_poi = 1
      params.poi_types = '所有'
      params.radius = poiRadius
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${BAIDU_API_BASE}/reverse_geocoding/v3/?${queryStr}`
    console.log('[BaiduMapProvider] 逆地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0) {
        console.error('[BaiduMapProvider] 逆地理编码失败:', data.message || data.msg)
        throw new Error(data.message || data.msg || '逆地理编码失败')
      }

      const result = data.result
      const component = result.addressComponent || {}

      const geocodeResult: ReverseGeocodeResult = {
        address: result.formatted_address || '',
        formattedAddress: result.sematic_description || result.formatted_address || '',
        province: component.province || '',
        city: component.city || '',
        district: component.district || '',
        street: component.street || '',
        streetNumber: component.street_number || '',
        cityCode: String(component.city_code || ''),
        adCode: String(component.adcode || ''),
      }

      // 解析 POI 列表
      if (getPoi && result.pois && result.pois.length > 0) {
        geocodeResult.pois = result.pois.map((poi: any) => ({
          name: poi.name || '',
          address: poi.addr || poi.address || '',
          latitude: poi.point?.y || 0,
          longitude: poi.point?.x || 0,
          distance: poi.distance ? Number(poi.distance) : undefined,
        }))
      }

      return geocodeResult
    } catch (error) {
      console.error('[BaiduMapProvider] 逆地理编码请求异常:', error)
      return { address: '' }
    }
  }

  /**
   * 地理编码：地址 -> 坐标
   * 文档：https://lbsyun.baidu.com/faq/api?title=webapi/guide/webservice-geocoding
   */
  async geocode(address: string, city?: string): Promise<GeocodeResult> {
    const params: Record<string, string> = {
      ak: this.config.key,
      address,
      output: 'json',
    }
    if (city) {
      params.city = city
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${BAIDU_API_BASE}/geocoding/v3/?${queryStr}`
    console.log('[BaiduMapProvider] 地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0) {
        console.error('[BaiduMapProvider] 地理编码失败:', data.message || data.msg)
        throw new Error(data.message || data.msg || '地理编码失败')
      }

      return {
        latitude: data.result.location.lat,
        longitude: data.result.location.lng,
        level: data.result.level,
        confidence: data.result.confidence,
      }
    } catch (error) {
      console.error('[BaiduMapProvider] 地理编码请求异常:', error)
      throw error
    }
  }

  /**
   * 坐标系转换
   * 文档：https://lbsyun.baidu.com/faq/api?title=webapi/guide/changeposition
   *
   * 将 WGS84 / GCJ02 坐标转换为百度坐标（bd09ll）
   */
  async convertCoord(
    lat: number,
    lng: number,
    from: CoordType
  ): Promise<Coordinate> {
    // 如果已经是百度坐标系，直接返回
    if (from === 'bd09ll') {
      return { latitude: lat, longitude: lng }
    }

    const coordsType = COORD_TYPE_MAP[from]
    if (!coordsType) {
      console.error(`[BaiduMapProvider] 不支持的坐标系转换: ${from}`)
      return { latitude: lat, longitude: lng }
    }

    const url = `${BAIDU_API_BASE}/geoconv/v1/?coords=${lng},${lat}&from=${coordsType}&to=5&ak=${this.config.key}`
    console.log('[BaiduMapProvider] 坐标转换请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== 0 || !data.result || data.result.length === 0) {
        console.error('[BaiduMapProvider] 坐标转换失败:', data.message || data.msg)
        return { latitude: lat, longitude: lng }
      }

      return {
        latitude: data.result[0].y,
        longitude: data.result[0].x,
      }
    } catch (error) {
      console.error('[BaiduMapProvider] 坐标转换请求异常:', error)
      return { latitude: lat, longitude: lng }
    }
  }
}
