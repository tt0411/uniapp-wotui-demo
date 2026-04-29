// 封装jsencrypt加密解密方法
import JSEncrypt from 'jsencrypt'
import { envConfig } from '@/config/env'
// 这里填入你的默认 RSA 公钥
// 建议在正式项目中将公钥配置到环境变量 (src/config/env.ts) 中
const PUBLIC_KEY = envConfig.publicKey
/*
 * RSA 加密方法
 * @param {string} plaintext 需要加密的明文数据
 * @param {string} [publicKey] 可选，自定义公钥。如果不传则使用默认公钥
 * @returns {string} 加密后的 base64 字符串。加密失败返回空字符串
 */
export function encryptRSA(plaintext: string): string {
    if (!plaintext) return ''

    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(PUBLIC_KEY)
    const result = encryptor.encrypt(plaintext)

    return result ? result : ''
}