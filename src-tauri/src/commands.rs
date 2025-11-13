// Tauri commands for environment variable management
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use std::fs;
use std::path::PathBuf;
use winreg::RegKey;
use winreg::enums::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvironmentVariable {
    pub id: String,
    pub name: String,
    pub value: String,
    #[serde(rename = "type")]
    pub var_type: String, // "user" or "system"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub remark: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: u64,
    #[serde(rename = "updatedAt")]
    pub updated_at: u64,
    #[serde(rename = "isValid")]
    pub is_valid: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchQuery {
    #[serde(rename = "nameKeyword")]
    pub name_keyword: Option<String>,
    #[serde(rename = "valueKeyword")]
    pub value_keyword: Option<String>,
    #[serde(rename = "remarkKeyword")]
    pub remark_keyword: Option<String>,
    pub types: Option<Vec<String>>,
    #[serde(rename = "dateRange")]
    pub date_range: Option<DateRange>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DateRange {
    pub start: u64,
    pub end: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    #[serde(rename = "releaseNotes")]
    pub release_notes: String,
    #[serde(rename = "downloadUrl")]
    pub download_url: String,
}

// Helper function to get current timestamp
#[allow(dead_code)]
fn get_current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

// 获取所有环境变量
#[tauri::command]
pub async fn get_environment_variables() -> Result<Vec<EnvironmentVariable>, String> {
    let current_time = get_current_timestamp();
    let mut variables = Vec::new();
    
    // 读取用户环境变量
    if let Ok(hkcu) = RegKey::predef(HKEY_CURRENT_USER).open_subkey("Environment") {
        for result in hkcu.enum_values() {
            if let Ok((name, value)) = result {
                let value_str = value.to_string();
                variables.push(EnvironmentVariable {
                    id: format!("user_{}", name),
                    name: name.clone(),
                    value: value_str,
                    var_type: "user".to_string(),
                    remark: None,
                    created_at: current_time,
                    updated_at: current_time,
                    is_valid: true,
                });
            }
        }
    }
    
    // 读取系统环境变量
    if let Ok(hklm) = RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey("SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment") {
        for result in hklm.enum_values() {
            if let Ok((name, value)) = result {
                let value_str = value.to_string();
                variables.push(EnvironmentVariable {
                    id: format!("system_{}", name),
                    name: name.clone(),
                    value: value_str,
                    var_type: "system".to_string(),
                    remark: None,
                    created_at: current_time,
                    updated_at: current_time,
                    is_valid: true,
                });
            }
        }
    }
    
    Ok(variables)
}

// 添加环境变量
#[tauri::command]
pub async fn add_environment_variable(variable: EnvironmentVariable) -> Result<EnvironmentVariable, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    let result = if variable.var_type == "system" {
        let env_key = hklm.open_subkey_with_flags(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
            KEY_SET_VALUE,
        );
        if let Ok(env_key) = env_key {
            env_key.set_value(&variable.name, &variable.value)
                .map_err(|e| format!("Failed to set system environment variable: {}", e))?;
            Ok(variable)
        } else {
            Err("Failed to open system environment key".to_string())
        }
    } else {
        let env_key = hkcu.open_subkey_with_flags("Environment", KEY_SET_VALUE);
        if let Ok(env_key) = env_key {
            env_key.set_value(&variable.name, &variable.value)
                .map_err(|e| format!("Failed to set user environment variable: {}", e))?;
            Ok(variable)
        } else {
            Err("Failed to open user environment key".to_string())
        }
    };
    
    result
}

// 更新环境变量
#[tauri::command]
pub async fn update_environment_variable(id: String, variable: EnvironmentVariable) -> Result<EnvironmentVariable, String> {
    let parts: Vec<&str> = id.split('_').collect();
    if parts.len() < 2 {
        return Err("无效的ID格式".to_string());
    }
    
    let var_type = parts[0];
    let name = &id[parts[0].len() + 1..];
    
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    let result = if var_type == "system" {
        let env_key = hklm.open_subkey_with_flags(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
            KEY_SET_VALUE,
        );
        if let Ok(env_key) = env_key {
            env_key.set_value(name, &variable.value)
                .map_err(|e| format!("Failed to update system environment variable: {}", e))?;
            // 通知系统环境变量已更改
            unsafe {
                use winapi::um::winuser::{SendMessageTimeoutW, HWND_BROADCAST, WM_SETTINGCHANGE, SMTO_ABORTIFHUNG};
                use winapi::um::winnt::LPCWSTR;
                use std::ffi::OsStr;
                use std::os::windows::ffi::OsStrExt;
                
                let env_str: Vec<u16> = OsStr::new("Environment")
                    .encode_wide()
                    .chain(std::iter::once(0))
                    .collect();
                
                SendMessageTimeoutW(
                    HWND_BROADCAST,
                    WM_SETTINGCHANGE,
                    0,
                    env_str.as_ptr() as isize,
                    SMTO_ABORTIFHUNG,
                    5000,
                    std::ptr::null_mut(),
                );
            }
            Ok(variable)
        } else {
            Err("Failed to open system environment key".to_string())
        }
    } else {
        let env_key = hkcu.open_subkey_with_flags("Environment", KEY_SET_VALUE);
        if let Ok(env_key) = env_key {
            env_key.set_value(name, &variable.value)
                .map_err(|e| format!("Failed to update user environment variable: {}", e))?;
            // 通知系统环境变量已更改
            unsafe {
                use winapi::um::winuser::{SendMessageTimeoutW, HWND_BROADCAST, WM_SETTINGCHANGE, SMTO_ABORTIFHUNG};
                use winapi::um::winnt::LPCWSTR;
                use std::ffi::OsStr;
                use std::os::windows::ffi::OsStrExt;
                
                let env_str: Vec<u16> = OsStr::new("Environment")
                    .encode_wide()
                    .chain(std::iter::once(0))
                    .collect();
                
                SendMessageTimeoutW(
                    HWND_BROADCAST,
                    WM_SETTINGCHANGE,
                    0,
                    env_str.as_ptr() as isize,
                    SMTO_ABORTIFHUNG,
                    5000,
                    std::ptr::null_mut(),
                );
            }
            Ok(variable)
        } else {
            Err("Failed to open user environment key".to_string())
        }
    };
    
    result
}

// 删除环境变量
#[tauri::command]
pub async fn delete_environment_variable(id: String) -> Result<(), String> {
    let parts: Vec<&str> = id.split('_').collect();
    if parts.len() < 2 {
        return Err("无效的ID格式".to_string());
    }
    
    let var_type = parts[0];
    let name = &id[parts[0].len() + 1..];
    
    // 检查是否为受保护的系统变量
    let protected_vars = ["PATH", "PATHEXT", "TEMP", "TMP", "WINDIR", "SYSTEMROOT", "PROGRAMFILES", "PROGRAMFILES(X86)"];
    if var_type == "system" && protected_vars.contains(&name.to_uppercase().as_str()) {
        return Err(format!("无法删除受保护的系统环境变量: {}", name));
    }
    
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    let result = if var_type == "system" {
        let env_key = hklm.open_subkey_with_flags(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
            KEY_SET_VALUE,
        );
        match env_key {
            Ok(env_key) => {
                match env_key.delete_value(name) {
                    Ok(_) => {
                        // 通知系统环境变量已更改
                        unsafe {
                            use winapi::um::winuser::{SendMessageTimeoutW, HWND_BROADCAST, WM_SETTINGCHANGE, SMTO_ABORTIFHUNG};
                            use winapi::um::winnt::LPCWSTR;
                            use std::ffi::OsStr;
                            use std::os::windows::ffi::OsStrExt;
                            
                            let env_str: Vec<u16> = OsStr::new("Environment")
                                .encode_wide()
                                .chain(std::iter::once(0))
                                .collect();
                            
                            SendMessageTimeoutW(
                                HWND_BROADCAST,
                                WM_SETTINGCHANGE,
                                0,
                                env_str.as_ptr() as isize,
                                SMTO_ABORTIFHUNG,
                                5000,
                                std::ptr::null_mut(),
                            );
                        }
                        Ok(())
                    },
                    Err(e) => {
                        let error_msg = match e.kind() {
                            std::io::ErrorKind::PermissionDenied => "权限不足，请以管理员身份运行程序".to_string(),
                            std::io::ErrorKind::NotFound => format!("环境变量 '{}' 不存在", name),
                            _ => format!("删除系统环境变量失败: {}", e)
                        };
                        Err(error_msg)
                    }
                }
            },
            Err(e) => {
                let error_msg = match e.kind() {
                    std::io::ErrorKind::PermissionDenied => "权限不足，无法访问系统环境变量，请以管理员身份运行程序".to_string(),
                    _ => "无法打开系统环境变量注册表项".to_string()
                };
                Err(error_msg)
            }
        }
    } else {
        let env_key = hkcu.open_subkey_with_flags("Environment", KEY_SET_VALUE);
        match env_key {
            Ok(env_key) => {
                match env_key.delete_value(name) {
                    Ok(_) => {
                        // 通知系统环境变量已更改
                        unsafe {
                            use winapi::um::winuser::{SendMessageTimeoutW, HWND_BROADCAST, WM_SETTINGCHANGE, SMTO_ABORTIFHUNG};
                            use winapi::um::winnt::LPCWSTR;
                            use std::ffi::OsStr;
                            use std::os::windows::ffi::OsStrExt;
                            
                            let env_str: Vec<u16> = OsStr::new("Environment")
                                .encode_wide()
                                .chain(std::iter::once(0))
                                .collect();
                            
                            SendMessageTimeoutW(
                                HWND_BROADCAST,
                                WM_SETTINGCHANGE,
                                0,
                                env_str.as_ptr() as isize,
                                SMTO_ABORTIFHUNG,
                                5000,
                                std::ptr::null_mut(),
                            );
                        }
                        Ok(())
                    },
                    Err(e) => {
                        let error_msg = match e.kind() {
                            std::io::ErrorKind::NotFound => format!("环境变量 '{}' 不存在", name),
                            _ => format!("删除用户环境变量失败: {}", e)
                        };
                        Err(error_msg)
                    }
                }
            },
            Err(_) => Err("无法打开用户环境变量注册表项".to_string())
        }
    };
    
    result
}

// 获取所有环境变量的映射表（用于变量引用解析）
fn get_all_env_vars_map() -> Result<std::collections::HashMap<String, String>, String> {
    use std::collections::HashMap;
    
    let mut env_map = HashMap::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    // 读取用户环境变量
    if let Ok(hkcu_env) = hkcu.open_subkey("Environment") {
        for result in hkcu_env.enum_values() {
            if let Ok((name, value)) = result {
                env_map.insert(name.to_uppercase(), value.to_string());
            }
        }
    }
    
    // 读取系统环境变量（系统变量优先级更高）
    if let Ok(hklm_env) = hklm.open_subkey(
        "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment"
    ) {
        for result in hklm_env.enum_values() {
            if let Ok((name, value)) = result {
                env_map.insert(name.to_uppercase(), value.to_string());
            }
        }
    }
    
    Ok(env_map)
}

// 展开环境变量引用（如%JAVA_HOME%）
fn expand_env_references(value: &str, env_map: &std::collections::HashMap<String, String>) -> String {
    use regex::Regex;
    
    let re = Regex::new(r"%([^%]+)%").unwrap();
    let mut expanded = value.to_string();
    
    // 最多展开5层嵌套引用，避免无限循环
    for _ in 0..5 {
        let mut changed = false;
        expanded = re.replace_all(&expanded, |caps: &regex::Captures| {
            let var_name = caps.get(1).unwrap().as_str().to_uppercase();
            if let Some(var_value) = env_map.get(&var_name) {
                changed = true;
                var_value.clone()
            } else {
                caps.get(0).unwrap().as_str().to_string() // 保持原样
            }
        }).to_string();
        
        if !changed {
            break;
        }
    }
    
    expanded
}

// 验证环境变量
#[tauri::command]
pub async fn validate_environment_variable(id: String) -> Result<bool, String> {
    use std::path::Path;
    
    // 解析ID获取变量类型和名称
    let parts: Vec<&str> = id.split('_').collect();
    if parts.len() < 2 {
        return Ok(false);
    }
    
    let var_type = parts[0];
    let name = &id[parts[0].len() + 1..];
    
    // 获取变量值
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    let value = if var_type == "system" {
        let env_key = hklm.open_subkey(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment"
        );
        if let Ok(env_key) = env_key {
            env_key.get_value::<String, _>(name)
                .map_err(|_| format!("System variable {} not found", name))?
        } else {
            return Err("Failed to open system environment key".to_string());
        }
    } else {
        let env_key = hkcu.open_subkey("Environment");
        if let Ok(env_key) = env_key {
            env_key.get_value::<String, _>(name)
                .map_err(|_| format!("User variable {} not found", name))?
        } else {
            return Err("Failed to open user environment key".to_string());
        }
    };
    
    // 获取所有环境变量用于引用解析
    let env_map = get_all_env_vars_map()?;
    
    // 根据变量名进行特定验证
    let is_valid = if name == "PATH" {
        // 验证PATH变量中的每个路径
        let paths: Vec<&str> = value.split(';').collect();
        let mut valid_count = 0;
        let mut total_count = 0;
        
        for path in paths.iter() {
            // 空路径跳过验证
            if path.trim().is_empty() {
                continue;
            }
            total_count += 1;
            
            // 展开环境变量引用
            let expanded_path = expand_env_references(path.trim(), &env_map);
            let path_obj = Path::new(&expanded_path);
            
            // 检查路径是否存在且可访问
            if path_obj.exists() {
                // 进一步检查是否可读取（可访问）
                if let Ok(metadata) = path_obj.metadata() {
                    if metadata.is_dir() {
                        valid_count += 1;
                    }
                }
            }
        }
        
        // 如果没有路径或者至少有一半路径有效，则认为有效
        total_count == 0 || (valid_count as f64 / total_count as f64) >= 0.5
    } else if name.ends_with("_HOME") || name.ends_with("_DIR") || name.ends_with("_PATH") || value.contains("\\") || value.contains("/") {
        // 对于可能指向目录或文件的变量进行验证
        // 展开环境变量引用
        let expanded_value = expand_env_references(&value, &env_map);
        let path_obj = Path::new(&expanded_value);
        path_obj.exists() && {
            // 检查是否可访问
            match path_obj.metadata() {
                Ok(_) => true,
                Err(_) => false,
            }
        }
    } else {
        // 其他变量默认为有效
        true
    };
    
    Ok(is_valid)
}

// 搜索环境变量
#[tauri::command]
pub async fn search_environment_variables(query: SearchQuery) -> Result<Vec<EnvironmentVariable>, String> {
    let all_variables = get_environment_variables().await?;
    
    let filtered_variables = all_variables.into_iter().filter(|var| {
        // 名称匹配
        let name_match = query.name_keyword.as_ref()
            .map(|keyword| var.name.to_lowercase().contains(&keyword.to_lowercase()))
            .unwrap_or(true);
        
        // 值匹配
        let value_match = query.value_keyword.as_ref()
            .map(|keyword| var.value.to_lowercase().contains(&keyword.to_lowercase()))
            .unwrap_or(true);
            
        // 备注匹配
        let remark_match = query.remark_keyword.as_ref()
            .map(|keyword| {
                var.remark.as_ref()
                    .map(|remark| remark.to_lowercase().contains(&keyword.to_lowercase()))
                    .unwrap_or(false)
            })
            .unwrap_or(true);
        
        // 类型匹配
        let type_match = query.types.as_ref()
            .map(|types| types.contains(&var.var_type))
            .unwrap_or(true);
        
        // 关键字匹配（名称或值匹配任一即可）
        let keyword_match = if query.name_keyword.is_some() || query.value_keyword.is_some() {
            name_match || value_match
        } else {
            true
        };
            
        keyword_match && remark_match && type_match
    }).collect();
    
    Ok(filtered_variables)
}

// 导出环境变量到文件
#[tauri::command]
pub async fn export_environment_variables() -> Result<String, String> {
    use std::fs::File;
    use std::io::Write;
    use chrono::Utc;
    use dirs::desktop_dir;
    
    // 获取所有环境变量
    let variables = get_environment_variables().await?;
    
    // 创建导出数据结构
    let export_data = serde_json::json!({
        "version": "1.0",
        "exportedAt": Utc::now().to_rfc3339(),
        "variables": variables
    });
    
    // 生成文件路径 (使用桌面路径)
    let desktop_path = desktop_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    let file_name = format!("env-export-{}.json", Utc::now().format("%Y%m%d-%H%M%S"));
    let file_path = desktop_path.join(&file_name);
    
    // 写入文件
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create export file: {}", e))?;
        
    file.write_all(serde_json::to_string_pretty(&export_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?.as_bytes())
        .map_err(|e| format!("Failed to write to file: {}", e))?;
    
    // 返回文件路径
    Ok(file_path.to_string_lossy().to_string())
}

// 从文件导入环境变量
#[tauri::command]
pub async fn import_environment_variables(file_path: String) -> Result<Vec<EnvironmentVariable>, String> {
    use std::fs::File;
    use std::io::Read;
    
    // 读取文件
    let mut file = File::open(&file_path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
        
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // 解析JSON
    let import_data: serde_json::Value = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    // 获取变量列表
    let variables: Vec<EnvironmentVariable> = serde_json::from_value(
        import_data["variables"].clone()
    ).map_err(|e| format!("Failed to extract variables: {}", e))?;
    
    // 处理导入的变量（添加到系统中）
    let mut imported_variables = Vec::new();
    for variable in variables {
        match add_environment_variable(variable.clone()).await {
            Ok(imported) => imported_variables.push(imported),
            Err(e) => eprintln!("Failed to import variable {}: {}", variable.name, e),
        }
    }
    
    Ok(imported_variables)
}

// 检查更新
#[tauri::command]
pub async fn check_for_updates() -> Result<Option<UpdateInfo>, String> {
    use reqwest;
    
    // GitHub API URL (需要替换为实际的仓库地址)
    let url = "https://api.github.com/repos/oliver/env-manager/releases/latest";
    
    // 发送请求
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header("User-Agent", "env-manager")
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;
    
    if !response.status().is_success() {
        return Err("Failed to fetch release information".to_string());
    }
    
    // 解析响应
    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    // 提取版本信息
    let latest_version = json["tag_name"]
        .as_str()
        .ok_or("Failed to extract version")?
        .to_string();
    
    // 当前版本 (从Cargo.toml获取)
    let current_version = env!("CARGO_PKG_VERSION");
    
    // 比较版本
    if latest_version.trim_start_matches('v') != current_version {
        Ok(Some(UpdateInfo {
            version: latest_version,
            release_notes: json["body"].as_str().unwrap_or("").to_string(),
            download_url: json["html_url"].as_str().unwrap_or("").to_string(),
        }))
    } else {
        Ok(None)
    }
}

// 设置相关的数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub theme: String, // "light", "dark", "system"
    #[serde(rename = "autoStart")]
    pub auto_start: bool,
    #[serde(rename = "showHotkey")]
    pub show_hotkey: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            auto_start: false,
            show_hotkey: "Ctrl+Shift+E".to_string(),
        }
    }
}

// 获取设置文件路径
fn get_settings_path() -> Result<PathBuf, String> {
    let home_dir = std::env::var("APPDATA")
        .or_else(|_| std::env::var("HOME"))
        .map_err(|_| "Failed to get home directory")?;
    let settings_dir = PathBuf::from(home_dir).join("env-manager");
    
    // 确保目录存在
    if !settings_dir.exists() {
        fs::create_dir_all(&settings_dir)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }
    
    Ok(settings_dir.join("settings.json"))
}

// 获取设置
#[tauri::command]
pub async fn get_settings() -> Result<AppSettings, String> {
    let settings_path = get_settings_path()?;
    
    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;
        
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))
    } else {
        Ok(AppSettings::default())
    }
}

// 保存设置
#[tauri::command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path()?;
    
    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&settings_path, content)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    
    // 如果开机自启设置发生变化，更新注册表
    update_auto_start(settings.auto_start)?;
    
    Ok(())
}

// 更新开机自启设置
fn update_auto_start(enable: bool) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu.open_subkey_with_flags("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", KEY_ALL_ACCESS)
        .map_err(|e| format!("Failed to open registry key: {}", e))?;
    
    let app_name = "EnvManager";
    
    if enable {
        // 获取当前可执行文件路径
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?;
        
        run_key.set_value(app_name, &exe_path.to_string_lossy().to_string())
            .map_err(|e| format!("Failed to set registry value: {}", e))?;
    } else {
        // 删除注册表项（忽略错误，因为可能不存在）
        let _ = run_key.delete_value(app_name);
    }
    
    Ok(())
}

// 检查是否已设置开机自启
#[tauri::command]
pub async fn check_auto_start() -> Result<bool, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run")
        .map_err(|e| format!("Failed to open registry key: {}", e))?;
    
    let app_name = "EnvManager";
    match run_key.get_value::<String, _>(app_name) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}