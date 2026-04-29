import { postJson } from "@/utils/request";

// 师傅端-系统错误日志
export const errorLogSave = (parameter: any) =>
    postJson(`/cbs-core-web/error-log/insert`, parameter) 