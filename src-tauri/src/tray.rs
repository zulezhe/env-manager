/*
 * @Author: oliver
 * @Date: 2025-09-08 11:41:08
 * @LastEditors: oliver
 * @LastEditTime: 2025-09-10 13:11:37
 * @Description: 
 */
// System tray implementation for the environment variable manager
use tauri::{
    AppHandle, Manager, Runtime, Emitter, menu::{Menu, MenuItem, PredefinedMenuItem, MenuId},
};

// 创建系统托盘
pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    // 创建菜单项
    let toggle_item = MenuItem::new(app, "显示/隐藏", true, None::<MenuId>)?;
    let settings_item = MenuItem::new(app, "设置", true, None::<MenuId>)?;
    let quit_item = MenuItem::new(app, "退出", true, None::<MenuId>)?;
    
    // 创建菜单
    let menu = Menu::with_items(app, &[
        &toggle_item,
        &PredefinedMenuItem::separator(app)?,
        &settings_item,
        &PredefinedMenuItem::separator(app)?,
        &quit_item,
    ])?;
    
    // 设置系统托盘
    app.set_menu(menu.clone())?;
    
    Ok(())
}

// 处理托盘事件
pub fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, event: tauri::menu::MenuEvent) {
    match event.id().0.as_str() {
        "显示/隐藏" => {
            // 切换窗口显示状态
            toggle_window_visibility(app);
        }
        "设置" => {
            // 显示窗口并导航到设置页面
            show_settings_window(app);
        }
        "退出" => {
            // 退出应用
            app.exit(0);
        }
        _ => {}
    }
}

// 切换窗口可见性
fn toggle_window_visibility<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

// 显示设置窗口
fn show_settings_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        // 发送事件到前端，切换到设置页面
        let _ = window.emit("navigate-to-settings", ());
    }
}