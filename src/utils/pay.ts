/**
 * 微信支付封装
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html
 */


export interface PaymentParams {
  /** 时间戳 */
  timeStamp: string
  /** 随机字符串 */
  nonceStr: string
  /** 统一下单接口返回的 prepay_id 参数值 */
  package: string
  /** 签名算法 */
  signType?: 'RSA' | 'MD5' | 'HMAC-SHA256'
  /** 签名 */
  paySign: string
}

export interface OrderCreateResult {
  orderId: string
  paymentParams: PaymentParams
}

/**
 * 调起微信支付
 * @param params 支付参数
 * @returns Promise<boolean> 支付是否成功
 */
export function requestPayment(params: PaymentParams): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showLoading({ title: '正在调起支付...' })
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType || 'RSA',
      paySign: params.paySign,
      success: () => {
        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })
        resolve(true)
      },
      fail: (err) => {
        uni.hideLoading()
        console.error('支付失败', err)
        if (err.errCode === 1000 || err.errMsg?.includes('cancel')) {
          uni.showToast({ title: '您取消了支付', icon: 'none' })
        } else if (err.errCode === 1001) {
          uni.showModal({
            title: '提示',
            content: '支付参数错误',
            showCancel: false,
          })
        } else {
          uni.showModal({
            title: '提示',
            content: '支付失败，请重试',
            showCancel: false,
          })
        }
        resolve(false)
      },
    })
  })
}

/**
 * 完整的支付流程封装（示例）
 * 实际项目中，orderCreate 应由后端接口完成
 * @param goodsId 商品 ID
 * @param quantity 数量
 */
export async function doPayment(goodsId: string, quantity = 1): Promise<boolean> {
  try {
    uni.showLoading({ title: '创建订单中...' })

    // Step 1: 创建订单（调后端接口）
    // const orderRes = await createOrder({ goodsId, quantity })
    // const { paymentParams } = orderRes.data

    // 模拟演示数据（实际项目中请删除）
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockPaymentParams: PaymentParams = {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: Math.random().toString(36).substring(2, 15),
      package: 'prepay_id=wx' + Math.random().toString(36).substring(2, 20),
      signType: 'RSA',
      paySign: 'mock_sign_' + Math.random().toString(36).substring(2, 10),
    }

    uni.hideLoading()

    // Step 2: 调起支付
    const success = await requestPayment(mockPaymentParams)

    // Step 3: 支付成功后的业务处理（如更新订单状态）
    if (success) {
      // await confirmOrderPayment(orderId)
    }

    return success
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '订单创建失败', icon: 'none' })
    console.error('支付流程异常', error)
    return false
  }
}
