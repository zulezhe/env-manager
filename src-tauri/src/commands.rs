// Tauri commands for environment variable management
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
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
    #[serde(rename = "remarkKeyword")]
    pub remark_keyword: Option<String>,
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
    // For simplicity, we'll delete and re-add the variable
    delete_environment_variable(id.clone()).await?;
    add_environment_variable(variable).await
}

// 删除环境变量
#[tauri::command]
pub async fn delete_environment_variable(id: String) -> Result<(), String> {
    let parts: Vec<&str> = id.split('_').collect();
    if parts.len() < 2 {
        return Err("Invalid ID format".to_string());
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
            env_key.delete_value(name)
                .map_err(|e| format!("Failed to delete system environment variable: {}", e))?;
            Ok(())
        } else {
            Err("Failed to open system environment key".to_string())
        }
    } else {
        let env_key = hkcu.open_subkey_with_flags("Environment", KEY_SET_VALUE);
        if let Ok(env_key) = env_key {
            env_key.delete_value(name)
                .map_err(|e| format!("Failed to delete user environment variable: {}", e))?;
            Ok(())
        } else {
            Err("Failed to open user environment key".to_string())
        }
    };
    
    result
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
    
    // 根据变量名进行特定验证
    let is_valid = if name == "PATH" {
        // 验证PATH变量中的每个路径
        let paths: Vec<&str> = value.split(';').collect();
        paths.iter().all(|path| {
            // 空路径跳过验证
            if path.is_empty() {
                return true;
            }
            Path::new(path).exists()
        })
    } else if name.ends_with("_HOME") || value.contains("\\") {
        // 对于可能指向目录的变量进行验证
        Path::new(&value).exists()
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
        let name_match = query.name_keyword.as_ref()
            .map(|keyword| var.name.to_lowercase().contains(&keyword.to_lowercase()))
            .unwrap_or(true);
            
        let remark_match = query.remark_keyword.as_ref()
            .map(|keyword| {
                var.remark.as_ref()
                    .map(|remark| remark.to_lowercase().contains(&keyword.to_lowercase()))
                    .unwrap_or(false)
            })
            .unwrap_or(true);
            
        name_match && remark_match
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