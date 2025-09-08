// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod tray;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_environment_variables,
            commands::add_environment_variable,
            commands::update_environment_variable,
            commands::delete_environment_variable,
            commands::validate_environment_variable,
            commands::search_environment_variables,
            commands::export_environment_variables,
            commands::import_environment_variables,
            commands::check_for_updates,
        ])
        .setup(|app| {
            #[cfg(target_os = "windows")]
            tray::create_tray(app.handle())?;
            Ok(())
        })
        .on_menu_event(tray::handle_menu_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}