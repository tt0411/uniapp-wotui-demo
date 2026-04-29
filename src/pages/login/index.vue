<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore, type Role } from '@/store/user'

const userStore = useUserStore()

const roles = ref([
  { label: '普通用户', value: 'user', icon: 'user', desc: '查看首页和个人中心' },
  { label: '管理员', value: 'admin', icon: 'settings', desc: '拥有管理后台权限' },
])

const currentRole = ref<Role>('user')

function handleLogin() {
  userStore.setRole(currentRole.value)
  userStore.setLogin(true)
  
  uni.showToast({
    title: `登录成功`,
    icon: 'success'
  })
  
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/tabs/home'
    })
  }, 1000)
}
</script>

<template>
  <view class="login-container">
    <view class="login-header">
      <view class="logo">🚀</view>
      <view class="title">身份选择进入</view>
      <view class="subtitle">模拟多角色 TabBar 渲染</view>
    </view>

    <view class="role-selector">
      <view 
        v-for="item in roles" 
        :key="item.value"
        class="role-card"
        :class="{ active: currentRole === item.value }"
        @click="currentRole = item.value as Role"
      >
        <view class="role-icon">
          <wd-icon :name="item.icon" size="24px" />
        </view>
        <view class="role-info">
          <view class="role-label">{{ item.label }}</view>
          <view class="role-desc">{{ item.desc }}</view>
        </view>
        <view class="role-check" v-if="currentRole === item.value">
          <wd-icon name="check-bold" color="var(--app-color-primary)" />
        </view>
      </view>
    </view>

    <view class="footer">
      <wd-button block size="large" @click="handleLogin">立即进入</wd-button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  box-sizing: border-box;
  background-color: var(--app-bg-card);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    font-size: 100rpx;
    margin-bottom: 30rpx;
  }
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: var(--app-text-muted);
  }
}

.role-selector {
  flex: 1;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: var(--app-bg-page);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &.active {
    background-color: var(--app-color-primary-soft);
    border-color: var(--app-color-primary);

    .role-icon {
      background-color: var(--app-color-primary);
      color: var(--app-text-inverse);
    }
  }
}

.role-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: var(--app-bg-surface-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-secondary);
  margin-right: 30rpx;
}

.role-info {
  flex: 1;
  
  .role-label {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 8rpx;
  }

  .role-desc {
    font-size: 24rpx;
    color: var(--app-text-muted);
  }
}

.footer {
  margin-top: 40rpx;
}
</style>
