# 环境变量管理器 (Environment Manager) - IFLOW 上下文

## 项目概述

这是一个基于 Tauri 框架构建的现代化 Windows 桌面应用程序，专门用于管理系统环境变量。项目采用 React + TypeScript 前端和 Rust 后端，提供直观的用户界面和强大的功能，让环境变量管理变得简单高效。

**核心功能包括：**
- 环境变量的查看、添加、编辑、删除（区分用户和系统变量）
- PATH 变量的专项管理（支持拖拽排序）
- 环境变量的搜索和过滤
- 环境变量的批量导入导出
- 无效环境变量的自动检测和标记
- 系统托盘集成和主题切换

## 技术栈

- **前端**: React 18, TypeScript, Tailwind CSS, Radix UI, Lucide React, Vite
- **后端**: Tauri, Rust
- **构建工具**: pnpm, Vite, Tauri CLI
- **系统交互**: 通过 Rust 的 `winreg` 库直接操作 Windows 注册表来管理环境变量

## 项目结构

```
env-manager/
├── src/                    # 前端源代码 (React + TypeScript)
│   ├── components/         # React 组件
│   │   ├── EnvironmentForm/      # 环境变量表单组件
│   │   ├── EnvironmentList/      # 环境变量列表组件（核心）
│   │   ├── Settings/             # 设置页面组件
│   │   └── ui/                   # 通用 UI 组件 (基于 Radix UI)
│   ├── contexts/           # React Context (如 ThemeContext)
│   ├── hooks/              # 自定义 React Hooks
│   ├── utils/              # 工具函数和类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── src-tauri/              # Tauri 后端源代码 (Rust)
│   ├── src/
│   │   ├── main.rs         # Tauri 后端主文件，注册命令和托盘
│   │   ├── commands.rs     # 实现所有 Tauri 命令 (增删改查环境变量等)
│   │   └── tray.rs         # 系统托盘实现
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 应用配置文件
├── package.json            # Node.js 依赖和脚本配置
├── vite.config.ts          # Vite 前端构建配置
└── ...                     # 其他配置文件 (tailwind, postcss, tsconfig等)
```

## 核心工作流程

1.  **前端 (React)**: `App.tsx` 是根组件，它渲染导航栏和主要内容（`EnvironmentList` 或 `Settings`）。
2.  **数据获取**: `EnvironmentList` 组件在挂载时调用 `loadEnvironmentVariables` 函数，该函数使用 Tauri 的 `invoke` API 调用名为 `get_environment_variables` 的后端命令。
3.  **后端 (Rust)**: `src-tauri/src/commands.rs` 文件中定义了 `get_environment_variables` 命令。该命令通过 `winreg` 库读取 Windows 注册表 (`HKEY_CURRENT_USER\Environment` 和 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`) 来获取用户和系统的环境变量，并将数据返回给前端。
4.  **数据展示与交互**: 前端接收到数据后，将其渲染在 `EnvironmentSection` 组件中。用户可以进行搜索、编辑、删除等操作，这些操作同样通过 `invoke` 调用对应的 Rust 命令（如 `update_environment_variable`, `delete_environment_variable`）来执行，并通过 `winreg` 库修改注册表。
5.  **特殊处理**: 对于 `PATH` 等包含分号分隔的变量，前端会将其拆分为子项进行展示和管理，提供更友好的用户体验。
6.  **系统托盘**: 应用启动时，`main.rs` 会调用 `tray::create_tray` 创建系统托盘图标，方便用户快速访问。

## 构建与运行

项目使用 `pnpm` 作为包管理器。

- **开发模式**: `pnpm tauri dev`
  - 此命令会同时启动 Vite 开发服务器和 Tauri 应用。
  - `package.json` 中的 `predev` 脚本会先执行 `sync-version.js` 同步版本号。
- **生产构建**: `pnpm tauri build`
  - 此命令会构建前端资源并打包成最终的 Windows 可执行文件。
  - `package.json` 中的 `prebuild` 脚本会先执行 `sync-version.js` 同步版本号。

## 关键文件说明

- `src/components/EnvironmentList/EnvironmentList.tsx`: 前端的核心组件，负责环境变量的展示、搜索、编辑、删除、验证等所有主要逻辑。
- `src-tauri/src/commands.rs`: 后端的核心文件，实现了所有与环境变量操作相关的 Tauri 命令，是前端与 Windows 系统交互的桥梁。
- `src/utils/types.ts`: 定义了 `EnvironmentVariable` 接口，是前后端数据交互的契约。
- `src-tauri/Cargo.toml`: 定义了 Rust 项目的依赖，关键依赖包括 `tauri`, `winreg` (用于操作注册表), `chrono` (处理时间) 等。