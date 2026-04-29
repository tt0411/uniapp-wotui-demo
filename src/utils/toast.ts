export function showSuccess(title: string, duration = 2000) {
  uni.showToast({
    title,
    icon: 'success',
    duration
  })
}

export function showError(title: string, duration = 2000) {
  uni.showToast({
    title,
    icon: 'none',
    duration
  })
}

export function showToast(title: string, duration = 2000) {
  uni.showToast({
    title,
    icon: 'none',
    duration
  })
}

export function showLoading(title = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

export function hideLoading() {
  uni.hideLoading()
}

export function showModal(title: string, content: string, showCancel = true): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      showCancel,
      success(res) {
        resolve(Boolean(res.confirm))
      },
      fail() {
        resolve(false)
      }
    })
  })
}
