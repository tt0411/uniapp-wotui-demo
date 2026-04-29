// 使用示例
/**
 * logger.error(this.__route__, 'mounted', error)
 */

import { errorLogSave } from "@/api/common"

type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "LOG"
const level: LogLevel = "ERROR" // ERROR、WARN、INFO、DEBUG、LOG

// 内部的时间格式化函数（替代原生不支持的 formatDate）
function formatDate(date: Date = new Date()): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export interface LoggerOptions {
    traceId?: string
    url?: string
    requestBody?: any
    [key: string]: any
}

function errorLog(message: string, stack: string = "", options: LoggerOptions = {}) {
    const { traceId, url, requestBody } = options
    const body = {
        message: message,
        stack: stack,
        cause: JSON.stringify(uni.getSystemInfoSync()),
        traceId: traceId || '不是请求错误',
        url: url || '不是请求错误',
        requestBody: requestBody ? JSON.stringify(requestBody) : "{}"
    }
    errorLogSave({ body })
}

function loggerBase(
    type: LogLevel,
    fileName: string,
    methodName: string,
    error: any,
    options: LoggerOptions = {}
) {
    const time = formatDate()
    let userInfo = uni.getStorageSync("userInfo")
    userInfo = userInfo ? JSON.stringify(userInfo) : "{}"

    // 更安全的错误信息解析
    let msg = ""
    let stack = ""
    if (typeof error === "object" && error !== null) {
        msg = error.message || error.errMsg || JSON.stringify(error)
        stack = error.stack || ""
    } else {
        msg = String(error)
    }

    const errorMsg = `[${time}] <${fileName}> {${methodName}} : '${msg}' \n 用户信息:${userInfo}`

    try {
        // 取消注释下方代码可以在控制台也输出对应级别的日志
        switch (type) {
            case "ERROR":
                if (level === type) errorLog(errorMsg, stack, options)
                break
            case "WARN":
                if (level === type) errorLog(errorMsg, stack, options)
                break
            case "INFO":
                if (level === type) errorLog(errorMsg, stack, options)
                break
            case "DEBUG":
                if (level === type) errorLog(errorMsg, stack, options)
                break
            case "LOG":
                if (level === type) errorLog(errorMsg, stack, options)
                break
        }
    } catch (err: any) {
        errorLog(
            `[${time}] <src/utils/logger.ts> {loggerBase} ${err?.message || String(err)}`,
            err?.stack || "",
            options
        )
    }
}

/**
 * 统一日志输出工具
 * @param fileName 文件名 / 路由路径
 * @param methodName 具体方法名称
 * @param error 错误信息或 Error 对象
 * @param options 附加选项 (traceId, url 等)
 */
export const logger = {
    debug(fileName: string, methodName: string, error: any, options?: LoggerOptions) {
        loggerBase("DEBUG", fileName, methodName, error, options)
    },
    log(fileName: string, methodName: string, error: any, options?: LoggerOptions) {
        loggerBase("LOG", fileName, methodName, error, options)
    },
    info(fileName: string, methodName: string, error: any, options?: LoggerOptions) {
        loggerBase("INFO", fileName, methodName, error, options)
    },
    warn(fileName: string, methodName: string, error: any, options?: LoggerOptions) {
        loggerBase("WARN", fileName, methodName, error, options)
    },
    error(fileName: string, methodName: string, error: any, options?: LoggerOptions) {
        loggerBase("ERROR", fileName, methodName, error, options)
    }
}
