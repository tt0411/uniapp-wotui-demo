import { envConfig } from '@/config/env'
// import { logger } from './logger'

const requestBaseUrl = envConfig.baseUrl

function setPlace(url: string, place: any): string {
  if (!place) return url
  let result = url
  for (const key in place) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), place[key])
  }
  return result
}

function urlJoint(url: string, params: any): string {
  if (!params) return url
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  return query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url
}

function replaceSpace(str: string): string {
  return str ? str.replace(/\s+/g, '') : ''
}

// ==========================================
// 拦截器机制
// ==========================================

type InterceptorFn = (optionsOrRes: any) => void

const interceptors = {
  request: {
    success: [] as InterceptorFn[],
    fail: [] as InterceptorFn[],
    use(success?: InterceptorFn, fail?: InterceptorFn) {
      if (typeof success === 'function') this.success.push(success)
      if (typeof fail === 'function') this.fail.push(fail)
    }
  },
  response: {
    success: [] as InterceptorFn[],
    fail: [] as InterceptorFn[],
    use(success?: InterceptorFn, fail?: InterceptorFn) {
      if (typeof success === 'function') this.success.push(success)
      if (typeof fail === 'function') this.fail.push(fail)
    }
  }
}

let issue = false

// ==========================================
// 核心 request 方法
// ==========================================

export interface RequestOption extends UniApp.RequestOptions {
  $place?: any
  params?: any
  showMsg?: boolean
  needHeader?: boolean
  config?: any // 用于保存原始配置
}

export function request(option: RequestOption): Promise<any> {
  const { request: reqInterceptors, response: resInterceptors } = interceptors

  // 执行请求拦截器
  for (let i = 0; i < reqInterceptors.success.length; i++) {
    const fn = reqInterceptors.success[i]
    fn(option)
  }

  return new Promise((resolve, reject) => {
    uni.request({
      timeout: 150000,
      ...option,
      success(res: any) {
        // 将 option 保存到 res 中
        res.config = option

        const { data, statusCode, header } = res
        if (statusCode === 200) {
          for (let i = 0; i < resInterceptors.success.length; i++) {
            const fn = resInterceptors.success[i]
            fn(res)
          }
          if (option.needHeader) {
            (data as any).header = header
          }
          resolve(data)
          return
        }
        for (let i = 0; i < resInterceptors.fail.length; i++) {
          const fn = resInterceptors.fail[i]
          fn(res)
        }
        reject(res)
      },
      fail(error: any) {
        // 将 option 保存到 error 中
        error.config = option

        for (let i = 0; i < resInterceptors.fail.length; i++) {
          const fn = resInterceptors.fail[i]
          fn(error)
        }
        reject(error)
      },
      complete() { }
    })
  })
}

// 统一请求拦截器操作
; (request as any).interceptors = interceptors

  // 注册默认请求拦截器
  ; (request as any).interceptors.request.use(
    (options: RequestOption) => {
      let url = options.url
      if (options.$place) {
        url = setPlace(url, options.$place)
      }
      if (options.params) {
        url = urlJoint(url, options.params)
      }
      options.url = requestBaseUrl + url

      let cookies = uni.getStorageSync('cookies')
      if (cookies && cookies.length) {
        if (!options.header) options.header = {}
          ; (options.header as any).cookie = cookies.join(';')
      }
    },
    (error: any) => { }
  )

  // 注册默认响应拦截器
  ; (request as any).interceptors.response.use(
    (res: any) => {
      // 微信小程序中 cookies 可能是数组形式，或者通过 header['Set-Cookie'] 获取
      const resCookies = res.cookies || (res.header && (res.header['Set-Cookie'] || res.header['set-cookie']))

      if (resCookies && resCookies.length) {
        console.log('res.cookies', resCookies)
        let cookies: string[] = []
        const cookieStr = typeof resCookies === 'string' ? resCookies : resCookies[0]
        const cookie = replaceSpace(cookieStr)
        let c = cookie.split(';')
        if (c) cookies = c

        let expired = true
        for (let i = 0; i < cookies.length; i++) {
          let key = cookies[i].split('=')[0]
          let value = cookies[i].split('=')[1]
          if (key === 'SESSION') {
            expired = false
            if (!value) {
              expired = true
            }
          }
        }
        if (expired) {
          uni.removeStorageSync('cookies')
        } else {
          uni.setStorageSync('cookies', cookies)
        }
      }

      if (res.data && res.data.code === 101) {
        uni.removeStorageSync('cookies')
        uni.reLaunch({ url: `/pages/login/index` })
        return
      }

      if (res.data && res.data.code < 0 && res.data.code !== -4) {
        let TraceId = res.header ? (res.header['Trace-Id'] || res.header['trace-id'] || '') : ''
        let content = res.data.message
        if (content === 'null' || content === 'undefined' || !content) {
          content = '网络错误，请稍后再试'
        }
        uni.hideLoading()

        if (res.config && res.config.showMsg !== false) {
          uni.showModal({
            title: '提示',
            content: content,
            cancelText: '错误上报',
            success(resModal) {
              if (resModal.cancel) {
                let clipboardData = 'ID：' + TraceId + '，' + content
                // logger.error("request.js", "request", clipboardData)
                uni.setClipboardData({
                  data: clipboardData,
                  success() {
                    uni.showToast({
                      title: '错误信息已复制,请提供给管理员',
                      icon: 'none',
                      duration: 3000
                    })
                  }
                })
              }
            },
            fail(err) {
              console.log(err)
              return
            }
          })
        }
      }

      if (res.data && res.data.code === -4) {
        if (issue) return
        if (!issue) {
          issue = true
          uni.showModal({
            title: '提示',
            content: res.data.message || '网络错误，请稍后再试',
            showCancel: false,
            success: function (resModal) { },
            fail(err) {
              console.log(err)
              return
            },
            complete: function () {
              issue = false
            }
          })
        }
      }
    },
    (error: any) => {
      uni.hideLoading()
      if (error.statusCode && error.statusCode === 500) {
        uni.showToast({
          title: '服务不可用',
          icon: 'none'
        })
        return
      }
      uni.showToast({
        title: '网络错误，请稍后再试',
        icon: 'none'
      })
    }
  )

// ==========================================
// 快捷请求方法封装
// ==========================================

export interface PostJsonData {
  body?: any
  place?: any
  params?: any
  showMsg?: boolean
  needHeader?: boolean
  XAuthorization?: string
}

export function postJson(url: string, data: PostJsonData = {}): Promise<any> {
  let { body, place, params, showMsg, needHeader, XAuthorization } = data
  let option: RequestOption = {
    url,
    params,
    $place: place,
    data: body,
    method: 'POST',
    showMsg: showMsg !== false,
    needHeader,
    header: {
      'content-type': 'application/json',
    }
  }
  if (XAuthorization && option.header) {
    ; (option.header as any)['X-Authorization'] = XAuthorization
  }
  return request(option)
}

export interface PostFormData {
  body?: any
  place?: any
  showMsg?: boolean
}

export function postForm(url: string, data: PostFormData = {}): Promise<any> {
  let { body, place, showMsg } = data || {}
  let option: RequestOption = {
    url,
    $place: place,
    data: body,
    method: 'POST',
    showMsg: showMsg !== false,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
  return request(option)
}

export interface GetData {
  body?: any
  place?: any
  params?: any
  showMsg?: boolean
}

export function get(url: string, data: GetData = {}): Promise<any> {
  let { body, place, params, showMsg } = data || {}
  let option: RequestOption = {
    url,
    params,
    $place: place,
    data: body,
    showMsg: showMsg !== false,
    method: 'GET'
  }
  return request(option)
}

export function upload(url: string, data: any, callback?: (task: any) => void): Promise<any> {
  let option: any = {
    url: requestBaseUrl + url,
    ...data
  }
  let cookies = uni.getStorageSync('cookies')
  if (cookies && cookies.length) {
    if (!option.header) option.header = {}
    option.header.cookie = cookies.join(';')
  }
  return new Promise((resolve, reject) => {
    let uploadTask = uni.uploadFile({
      ...option,
      timeout: 150000,
      success(res: any) {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(res.data))
            return
          }
          uni.showToast({
            title: '上传失败',
            icon: 'none',
            duration: 2000
          })
          reject(res)
        } catch (error) {
          reject(error)
        }
      },
      fail(error: any) {
        console.log(error)
        reject(error)
      },
      complete() { }
    })
    callback && callback(uploadTask)
  })
}
