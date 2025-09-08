# 环境变量管理器 (env-manager)

一个基于 Tauri 构建的 Windows 桌面应用程序，用于管理 Windows 系统环境变量。

## 功能特性

- 查看系统环境变量列表
- 添加、编辑和删除环境变量
- 支持用户变量和系统变量
- 环境变量有效性检测
- 导入导出功能
- 关键字搜索
- 系统托盘支持

## 技术栈

- 前端: React + TypeScript + Tailwind CSS
- 构建工具: Vite
- 桌面应用框架: Tauri
- 后端: Rust

## 项目结构

```
env-manager/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 React Hooks
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 应用入口
├── src-tauri/              # Tauri 后端源代码
│   ├── src/
│   │   ├── main.rs         # Tauri 后端主文件
│   │   ├── commands.rs     # Tauri 命令实现
│   │   └── tray.rs         # 系统托盘实现
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置文件
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── package.json            # Node.js 依赖配置
├── tailwind.config.js      # Tailwind CSS 配置
└── vite.config.ts          # Vite 配置
```

## 开发环境搭建

1. 安装 Node.js (推荐 LTS 版本)
2. 安装 Rust (通过 rustup):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
3. 安装 Tauri CLI:
   ```bash
   npm install -g @tauri-apps/cli
   ```

## 运行项目

### 开发模式

```bash
npm run tauri dev
```

### 构建应用

```bash
npm run tauri build
```

## 项目配置

### 环境变量

项目使用 Tauri 的 API 来访问和修改系统环境变量。

### 权限说明

修改系统环境变量需要管理员权限。应用程序会在需要时请求提升权限。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

[MIT](LICENSE)