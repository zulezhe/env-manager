# 发布指南

本文档说明如何使用 GitHub Actions 自动构建和发布环境变量管理器。

## 🚀 自动发布流程

### 触发条件
- 推送到 `main` 分支时自动触发构建和发布流程
- 只有当版本号发生变化时才会创建新的 Release

### 发布步骤

1. **测试阶段**
   - 在多个平台（Windows、macOS、Linux）上运行测试
   - 安装依赖并构建前端
   - 验证代码质量

2. **构建阶段**
   - 同步 `package.json` 和 `tauri.conf.json` 的版本号
   - 构建 Tauri 应用程序
   - 生成安装包（.msi、.exe 等）

3. **发布阶段**
   - 检查版本标签是否已存在
   - 创建 GitHub Release
   - 上传构建产物

## 📦 手动发布

### 方法一：使用发布脚本（推荐）

```bash
# 发布补丁版本 (1.0.0 -> 1.0.1)
npm run release:patch

# 发布次要版本 (1.0.0 -> 1.1.0)
npm run release:minor

# 发布主要版本 (1.0.0 -> 2.0.0)
npm run release:major
```

脚本会自动：
- 更新版本号
- 同步 Tauri 配置
- 提供 git 命令提示

### 方法二：手动操作

1. **更新版本号**
   ```bash
   npm version patch  # 或 minor, major
   ```

2. **同步版本到 Tauri**
   ```bash
   npm run sync-version
   ```

3. **提交并推送**
   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git push origin main
   ```

## 🔧 配置说明

### GitHub Actions 工作流

#### `.github/workflows/release.yml`
- **用途**：主发布工作流
- **触发**：推送到 main 分支
- **功能**：构建应用并创建 Release

#### `.github/workflows/build.yml`
- **用途**：构建和测试工作流
- **触发**：推送到任何分支或 PR
- **功能**：多平台构建测试

### 版本管理

#### `scripts/sync-version.js`
- 同步 `package.json` 和 `src-tauri/tauri.conf.json` 的版本号
- 确保前后端版本一致

#### `scripts/release.js`
- 自动化发布流程
- 支持语义化版本控制

## 📋 发布检查清单

发布前请确认：

- [ ] 代码已合并到 `main` 分支
- [ ] 所有测试通过
- [ ] 版本号已正确更新
- [ ] CHANGELOG.md 已更新（如果有）
- [ ] 构建配置正确
- [ ] 图标文件存在（`src-tauri/icons/icon.ico`）

## 🛠️ 构建产物

### Windows
- `.msi` 安装包（推荐）
- `.exe` 安装程序

### macOS
- `.dmg` 磁盘映像
- `.app` 应用程序包

### Linux
- `.deb` Debian 包
- `.rpm` Red Hat 包
- `.AppImage` 便携应用

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查 Rust 和 Node.js 版本
   - 确认依赖安装正确
   - 查看 GitHub Actions 日志

2. **版本冲突**
   - 运行 `npm run sync-version` 同步版本
   - 检查 `package.json` 和 `tauri.conf.json`

3. **Release 未创建**
   - 确认版本号已更改
   - 检查 GitHub token 权限
   - 查看工作流日志

### 调试命令

```bash
# 检查版本同步
npm run sync-version

# 本地构建测试
npm run tauri:build

# 查看当前版本
node -e "console.log(require('./package.json').version)"
```

## 📚 相关文档

- [Tauri 构建指南](https://tauri.app/v1/guides/building/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本控制](https://semver.org/lang/zh-CN/)

## 🤝 贡献

如果您发现发布流程中的问题或有改进建议，请：

1. 创建 Issue 描述问题
2. 提交 Pull Request 修复问题
3. 更新相关文档

---

**注意**：首次设置时，请确保 GitHub 仓库已启用 Actions 并具有适当的权限。