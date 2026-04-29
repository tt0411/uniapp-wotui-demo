import { defineConfig } from 'vite'
import { resolve } from 'path'
import uni from '@dcloudio/vite-plugin-uni'
import UniKuRoot from '@uni-ku/root'
import UnoCSS from 'unocss/vite'
import presetWeapp from 'unocss-preset-weapp'
import { transformerAttributify, transformerClass } from 'unocss-preset-weapp/transformer'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    UniKuRoot(),
    uni(),
    UnoCSS({
      presets: [
        presetWeapp({
          platform: 'uniapp',
        }),
      ],
      transformers: [
        transformerAttributify(),
        transformerClass(),
      ],
      shortcuts: {
        'flex-center': 'flex items-center justify-center',
        'flex-between': 'flex items-center justify-between',
        'flex-col-center': 'flex flex-col items-center justify-center',
      },
      theme: {
        colors: {
          primary: '#2B9939',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['legacy-js-api'],
        logger: {
          warn(message: any, options: any) {
            if (options.deprecation && message.includes('legacy-js-api')) return
            console.warn(message)
          },
        },
      },
    },
  },
})
