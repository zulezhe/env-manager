#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取 package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 读取 tauri.conf.json
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));

// 更新 tauri.conf.json 的版本
tauriConf.version = version;

// 写回 tauri.conf.json
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

console.log(`✅ 版本同步完成: ${version}`);
console.log(`📦 package.json: ${version}`);
console.log(`🦀 tauri.conf.json: ${version}`);