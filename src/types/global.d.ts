// 全局类型声明
declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: any) => Promise<any>;
      event: {
        listen: (event: string, handler: (event: any) => void) => Promise<() => void>;
      };
    };
  }
}

export {};