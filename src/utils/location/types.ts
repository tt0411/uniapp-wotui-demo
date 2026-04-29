/**
 * 定位模块 - 类型定义
 * 定义所有地图服务提供商共用的接口和类型
 */

/** 坐标系类型 */
export type CoordType = 'wgs84' | 'gcj02' | 'bd09ll'

/** 基础坐标信息 */
export interface Coordinate {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
}

/** 定位结果 */
export interface LocationResult extends Coordinate {
  /** 速度（m/s） */
  speed?: number
  /** 精度（m） */
  accuracy?: number
  /** 海拔（m） */
  altitude?: number
  /** 垂直精度（m） */
  verticalAccuracy?: number
  /** 水平精度（m） */
  horizontalAccuracy?: number
  /** 地址描述 */
  address?: string
  /** 位置名称 */
  name?: string
  /** 城市 */
  city?: string
  /** 区/县 */
  district?: string
  /** 省份 */
  province?: string
  /** 街道 */
  street?: string
  /** 门牌号 */
  streetNumber?: string
  /** 城市编码 */
  cityCode?: string
  /** 行政区划编码 */
  adCode?: string
}

/** 逆地理编码结果 */
export interface ReverseGeocodeResult {
  /** 格式化地址 */
  address: string
  /** 推荐的格式化地址 */
  formattedAddress?: string
  /** 省份 */
  province?: string
  /** 城市 */
  city?: string
  /** 区/县 */
  district?: string
  /** 街道 */
  street?: string
  /** 门牌号 */
  streetNumber?: string
  /** 城市编码 */
  cityCode?: string
  /** 行政区划编码 */
  adCode?: string
  /** POI 列表 */
  pois?: Array<{
    name: string
    address: string
    latitude: number
    longitude: number
    distance?: number
  }>
}

/** 地理编码结果（地址 -> 坐标） */
export interface GeocodeResult extends Coordinate {
  /** 精度等级 */
  level?: string
  /** 可信度（0-100） */
  confidence?: number
}

/** 定位配置选项 */
export interface LocationOptions {
  /** 坐标系类型，默认 gcj02 */
  type?: CoordType
  /** 是否需要高精度定位，默认 true */
  isHighAccuracy?: boolean
  /** 高精度定位超时时间（ms），默认 3000 */
  highAccuracyExpireTime?: number
  /** 是否需要海拔信息，默认 false */
  altitude?: boolean
  /** 是否需要地址信息（逆地理编码），默认 false */
  needAddress?: boolean
}

/** 逆地理编码选项 */
export interface ReverseGeocodeOptions {
  /** 是否获取附近 POI 信息，默认 false */
  getPoi?: boolean
  /** POI 获取半径（m），默认 1000 */
  poiRadius?: number
}

/** 地图服务提供商配置 */
export interface MapProviderConfig {
  /** 地图服务商的 API Key */
  key: string
  /** 安全密钥（部分服务商需要） */
  secretKey?: string
  /** 坐标系类型（百度用 bd09ll，高德/腾讯用 gcj02） */
  coordType?: CoordType
}

/**
 * 地图服务提供商接口
 * 所有地图服务商（百度、高德、腾讯等）必须实现此接口
 */
export interface IMapProvider {
  /** 提供商名称标识 */
  readonly name: string

  /**
   * 逆地理编码：坐标 -> 地址
   * @param lat 纬度
   * @param lng 经度
   * @param options 选项
   */
  reverseGeocode(
    lat: number,
    lng: number,
    options?: ReverseGeocodeOptions
  ): Promise<ReverseGeocodeResult>

  /**
   * 地理编码：地址 -> 坐标
   * @param address 地址字符串
   * @param city 城市（可选，用于提高精度）
   */
  geocode(address: string, city?: string): Promise<GeocodeResult>

  /**
   * 坐标系转换
   * 将 WGS84 或其他坐标系转换为当前服务商使用的坐标系
   * @param lat 纬度
   * @param lng 经度
   * @param from 源坐标系
   */
  convertCoord?(
    lat: number,
    lng: number,
    from: CoordType
  ): Promise<Coordinate>
}
