/**
 * 订阅消息封装
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
 */

import { showError, showSuccess, showModal } from './toast'

export interface SubscribeTemplate {
  tmplId: string
  desc?: string
}

/**
 * 订阅单条消息
 * @param tmplId 模板 ID
 * @returns Promise<boolean> 是否订阅成功
 */
export function subscribeMessage(tmplId: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: (res: any) => {
        const result = res[tmplId]
        if (result === 'accept') {
          showSuccess('订阅成功')
          resolve(true)
        } else if (result === 'reject') {
          showError('您拒绝了订阅')
          resolve(false)
        } else if (result === 'ban') {
          showError('订阅被后台封禁')
          resolve(false)
        } else {
          resolve(false)
        }
      },
      fail: (err) => {
        console.error('订阅失败', err)
        if (err.errCode === 20004) {
          showModal('提示', '您已关闭订阅消息权限，是否前往设置开启？').then((confirm) => {
            if (confirm) {
              uni.openSetting({
                withSubscriptions: true,
              })
            }
          })
        } else {
          showError('订阅失败')
        }
        resolve(false)
      },
    })
  })
}

/**
 * 订阅多条消息
 * @param tmplIds 模板 ID 数组（最多 3 条）
 * @returns Promise<Record<string, string>> 各模板订阅结果
 */
export function subscribeMessages(tmplIds: string[]): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    if (tmplIds.length === 0) {
      resolve({})
      return
    }
    uni.requestSubscribeMessage({
      tmplIds,
      success: (res: any) => {
        const results: Record<string, string> = {}
        let allAccept = true
        tmplIds.forEach((id) => {
          results[id] = res[id] as string
          if (res[id] !== 'accept') {
            allAccept = false
          }
        })
        if (allAccept) {
          showSuccess('订阅成功')
        }
        resolve(results)
      },
      fail: (err) => {
        console.error('批量订阅失败', err)
        if (err.errCode === 20004) {
          showModal('提示', '您已关闭订阅消息权限，是否前往设置开启？').then((confirm) => {
            if (confirm) {
              uni.openSetting({ withSubscriptions: true })
            }
          })
        } else {
          showError('订阅失败')
        }
        resolve({})
      },
    })
  })
}

/**
 * 获取用户订阅设置（了解用户对模板的订阅状态）
 */
export function getSubscriptionSetting(): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      withSubscriptions: true,
      success: resolve,
      fail: reject,
    })
  })
}
