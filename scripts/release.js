#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ 版本类型必须是: patch, minor, major');
  process.exit(1);
}

try {
  console.log(`🚀 开始发布 ${versionType} 版本...`);
  
  // 更新版本号
  console.log('📦 更新版本号...');
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  
  // 同步版本到 Tauri
  console.log('🔄 同步版本到 Tauri...');
  execSync('npm run sync-version', { stdio: 'inherit' });
  
  // 读取新版本号
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const newVersion = packageJson.version;
  
  console.log(`✅ 版本更新完成: v${newVersion}`);
  console.log('📝 请手动提交更改并推送到 main 分支以触发自动发布:');
  console.log('');
  console.log('  git add .');
  console.log(`  git commit -m "chore: release v${newVersion}"`);
  console.log('  git push origin main');
  console.log('');
  console.log('🎉 GitHub Actions 将自动构建并创建 Release!');
  
} catch (error) {
  console.error('❌ 发布失败:', error.message);
  process.exit(1);
}