# 环境变量管理器 (Environment Manager)

一个基于 Tauri 构建的现代化 Windows 桌面应用程序，用于管理系统环境变量。提供直观的用户界面和强大的功能，让环境变量管理变得简单高效。

## ✨ 功能特性

### 🎯 核心功能
- **环境变量管理**：查看、添加、编辑、删除系统和用户环境变量
- **PATH 变量专项管理**：专门的 PATH 变量编辑器，支持拖拽排序
- **搜索和过滤**：快速搜索和过滤环境变量
- **导入导出**：支持环境变量的批量导入和导出
- **无效变量检测**：自动检测和标记无效的环境变量

### 🎨 用户体验
- **现代化 UI**：基于 Tailwind CSS 和 Radix UI 的精美界面
- **深色/浅色主题**：支持主题切换
- **响应式设计**：适配不同屏幕尺寸
- **系统托盘集成**：最小化到系统托盘，快速访问
- **实时预览**：环境变量修改的实时预览

### 🔧 高级功能
- **批量操作**：支持多选和批量操作
- **历史记录**：操作历史记录和撤销功能
- **备份恢复**：环境变量配置的备份和恢复
- **安全验证**：修改前的安全确认机制

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无障碍的 UI 组件库
- **Lucide React** - 精美的图标库
- **Vite** - 快速的前端构建工具

### 后端技术
- **Tauri** - 安全、快速的桌面应用框架
- **Rust** - 系统级编程语言，提供高性能和安全性

### 开发工具
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 自动前缀添加

## 📦 安装说明

### 系统要求
- Windows 10/11 (64-bit)
- 至少 100MB 可用磁盘空间
- 管理员权限（用于修改系统环境变量）

### 从源码构建

#### 前置要求
- [Node.js](https://nodejs.org/) (版本 16 或更高)
- [Rust](https://rustup.rs/) (最新稳定版)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

#### 构建步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/zulezhe/env-manager.git
   cd env-manager
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **开发模式运行**
   ```bash
   pnpm tauri dev
   ```

4. **构建生产版本**
   ```bash
   pnpm tauri build
   ```

## 🚀 使用指南

### 基本操作

1. **启动应用**
   - 双击应用图标启动
   - 应用会显示当前系统的所有环境变量

2. **查看环境变量**
   - 主界面显示用户和系统环境变量
   - 使用搜索框快速查找特定变量
   - 点击变量名查看详细信息

3. **添加环境变量**
   - 点击「添加变量」按钮
   - 输入变量名和值
   - 选择变量类型（用户/系统）
   - 点击保存

4. **编辑环境变量**
   - 点击变量右侧的编辑按钮
   - 修改变量值
   - 保存更改

5. **删除环境变量**
   - 点击变量右侧的删除按钮
   - 确认删除操作

### PATH 变量管理

1. **打开 PATH 编辑器**
   - 找到 PATH 变量
   - 点击「编辑 PATH」按钮

2. **管理 PATH 条目**
   - 查看所有 PATH 条目
   - 拖拽调整顺序
   - 添加新路径
   - 删除无效路径

### 导入导出

1. **导出环境变量**
   - 点击「导出」按钮
   - 选择导出格式（JSON/CSV）
   - 选择保存位置

2. **导入环境变量**
   - 点击「导入」按钮
   - 选择配置文件
   - 预览更改
   - 确认导入

## 📁 项目结构

```
env-manager/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   │   ├── EnvironmentForm/      # 环境变量表单组件
│   │   ├── EnvironmentList/      # 环境变量列表组件
│   │   ├── Settings/             # 设置页面组件
│   │   └── ui/                   # 通用 UI 组件
│   ├── contexts/           # React Context
│   ├── hooks/              # 自定义 React Hooks
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── src-tauri/              # Tauri 后端源代码
│   ├── src/
│   │   ├── main.rs         # Tauri 后端主文件
│   │   ├── commands.rs     # Tauri 命令实现
│   │   └── tray.rs         # 系统托盘实现
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置文件
├── index.html              # HTML 模板
├── package.json            # Node.js 依赖配置
├── tailwind.config.js      # Tailwind CSS 配置
├── postcss.config.js       # PostCSS 配置
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## ⚙️ 配置选项

### 主题设置
- 在设置页面可以切换深色/浅色主题
- 支持跟随系统主题

### 安全设置
- 启用/禁用修改确认对话框
- 设置备份频率
- 配置无效变量检测

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 报告问题
- 使用 [GitHub Issues](https://github.com/zulezhe/env-manager/issues) 报告 bug
- 提供详细的问题描述和复现步骤
- 包含系统信息和错误日志

### 提交代码
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发规范
- 遵循现有的代码风格
- 添加适当的注释和文档
- 确保所有测试通过
- 更新相关文档

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情。

## 🙏 致谢

感谢以下开源项目和社区：

- [Tauri](https://tauri.app/) - 强大的桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - UI 组件库
- [Lucide](https://lucide.dev/) - 图标库

## 📞 联系方式

- 项目主页：[GitHub Repository](https://github.com/zulezhe/env-manager)
- 问题反馈：[GitHub Issues](https://github.com/zulezhe/env-manager/issues)

## 🔄 更新日志

### v1.0.0 (2024-01-XX)
- 🎉 首次发布
- ✨ 基本的环境变量管理功能
- 🎨 现代化用户界面
- 🔧 PATH 变量专项管理
- 📦 导入导出功能
- 🌙 深色主题支持

---

**注意**：本应用需要管理员权限来修改系统环境变量。请确保以管理员身份运行应用程序以获得完整功能。