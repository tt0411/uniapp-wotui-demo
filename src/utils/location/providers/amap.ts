/**
 * 高德地图服务提供商实现（预留）
 * 文档：https://lbs.amap.com/api/webservice/guide/api/georegeo
 *
 * 高德地图使用 gcj02 坐标系，与微信小程序原生 getLocation 返回的坐标系一致，
 * 无需额外做坐标转换。
 *
 * 使用前需在高德开放平台申请 Web 服务 API Key。
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

/** 高德地图 API 基础地址 */
const AMAP_API_BASE = 'https://restapi.amap.com/v3'

export class AmapProvider implements IMapProvider {
  readonly name = 'amap'
  private config: MapProviderConfig

  constructor(config: MapProviderConfig) {
    if (!config.key) {
      console.error('[AmapProvider] 缺少高德地图 API Key，逆地理编码等功能将不可用')
    }
    this.config = {
      coordType: 'gcj02',
      ...config,
    }
  }

  /**
   * 逆地理编码：坐标 -> 地址
   * 文档：https://lbs.amap.com/api/webservice/guide/api/georegeo#regeo
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    options: ReverseGeocodeOptions = {}
  ): Promise<ReverseGeocodeResult> {
    const { getPoi = false, poiRadius = 1000 } = options

    const params: Record<string, string | number> = {
      key: this.config.key,
      location: `${lng},${lat}`, // 高德是 经度,纬度 格式
      output: 'JSON',
      extensions: getPoi ? 'all' : 'base',
    }
    if (getPoi) {
      params.radius = poiRadius
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${AMAP_API_BASE}/geocode/regeo?${queryStr}`
    console.log('[AmapProvider] 逆地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== '1') {
        console.error('[AmapProvider] 逆地理编码失败:', data.info)
        throw new Error(data.info || '逆地理编码失败')
      }

      const regeocode = data.regeocode || {}
      const component = regeocode.addressComponent || {}

      const geocodeResult: ReverseGeocodeResult = {
        address: regeocode.formatted_address || '',
        formattedAddress: regeocode.formatted_address || '',
        province: component.province || '',
        city: Array.isArray(component.city) ? '' : (component.city || ''),
        district: component.district || '',
        street: component.streetNumber?.street || '',
        streetNumber: component.streetNumber?.number || '',
        cityCode: component.citycode || '',
        adCode: component.adcode || '',
      }

      // 解析 POI 列表
      if (getPoi && regeocode.pois && regeocode.pois.length > 0) {
        geocodeResult.pois = regeocode.pois.map((poi: any) => {
          const [poiLng, poiLat] = (poi.location || '').split(',').map(Number)
          return {
            name: poi.name || '',
            address: poi.address || '',
            latitude: poiLat || 0,
            longitude: poiLng || 0,
            distance: poi.distance ? Number(poi.distance) : undefined,
          }
        })
      }

      return geocodeResult
    } catch (error) {
      console.error('[AmapProvider] 逆地理编码请求异常:', error)
      return { address: '' }
    }
  }

  /**
   * 地理编码：地址 -> 坐标
   * 文档：https://lbs.amap.com/api/webservice/guide/api/georegeo#geo
   */
  async geocode(address: string, city?: string): Promise<GeocodeResult> {
    const params: Record<string, string> = {
      key: this.config.key,
      address,
      output: 'JSON',
    }
    if (city) {
      params.city = city
    }

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${AMAP_API_BASE}/geocode/geo?${queryStr}`
    console.log('[AmapProvider] 地理编码请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
        console.error('[AmapProvider] 地理编码失败:', data.info)
        throw new Error(data.info || '地理编码失败')
      }

      const geocode = data.geocodes[0]
      const [lng, lat] = (geocode.location || '').split(',').map(Number)

      return {
        latitude: lat,
        longitude: lng,
        level: geocode.level,
      }
    } catch (error) {
      console.error('[AmapProvider] 地理编码请求异常:', error)
      throw error
    }
  }

  /**
   * 坐标转换（高德使用 gcj02，与微信小程序一致，通常不需要转换）
   */
  async convertCoord(
    lat: number,
    lng: number,
    from: CoordType
  ): Promise<Coordinate> {
    // 如果已经是 gcj02，直接返回
    if (from === 'gcj02') {
      return { latitude: lat, longitude: lng }
    }

    // 高德坐标转换 API
    const coordSysMap: Record<string, string> = {
      wgs84: 'gps',
      bd09ll: 'baidu',
    }
    const coordSys = coordSysMap[from]
    if (!coordSys) {
      console.error(`[AmapProvider] 不支持的坐标系转换: ${from}`)
      return { latitude: lat, longitude: lng }
    }

    const url = `${AMAP_API_BASE}/assistant/coordinate/convert?key=${this.config.key}&locations=${lng},${lat}&coordsys=${coordSys}`
    console.log('[AmapProvider] 坐标转换请求:', url)

    try {
      const res = await uni.request({ url, method: 'GET' })
      const data = res.data as any

      if (data.status !== '1' || !data.locations) {
        console.error('[AmapProvider] 坐标转换失败:', data.info)
        return { latitude: lat, longitude: lng }
      }

      const [newLng, newLat] = data.locations.split(',').map(Number)
      return {
        latitude: newLat,
        longitude: newLng,
      }
    } catch (error) {
      console.error('[AmapProvider] 坐标转换请求异常:', error)
      return { latitude: lat, longitude: lng }
    }
  }
}
