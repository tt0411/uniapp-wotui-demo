import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Role = 'user' | 'admin'

export interface UserInfo {
  avatar: string
  nickname: string
  phone?: string
}

export const useUserStore = defineStore('user', () => {
  const role = ref<Role>('user')
  const isLoggedIn = ref<boolean>(false)
  const userInfo = ref<UserInfo>({
    avatar: 'https://picsum.photos/200/200?random=3',
    nickname: '点击登录',
  })

  function setUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
  }

  function setRole(newRole: Role) {
    role.value = newRole
  }

  function setLogin(status: boolean) {
    isLoggedIn.value = status
  }

  return {
    role,
    isLoggedIn,
    userInfo,
    setUserInfo,
    setRole,
    setLogin
  }
})

