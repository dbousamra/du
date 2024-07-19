// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::{env, fs, os::unix::fs::MetadataExt, path::Path};
use tauri::Manager;
use walkdir::WalkDir;
use window_vibrancy::*;

#[derive(Debug, Clone, Serialize)]
struct Node {
    path: String,
    absolute_path: String,
    size: u64,
    children: Vec<Node>,
}

fn walk(path: &Path) -> Node {
    let mut size = 0;
    let mut children: Vec<Node> = vec![];

    for entry in WalkDir::new(path).max_depth(1) {
        match entry {
            Ok(entry) => {
                // check if entry and path are the same
                if entry.path() == path {
                    continue;
                }

                let metadata = entry.metadata().unwrap();

                if metadata.is_file() {
                    let node = Node {
                        path: entry.file_name().to_str().unwrap().to_string(),
                        absolute_path: entry.path().to_str().unwrap().to_string(),
                        size: metadata.size(),
                        children: vec![],
                    };
                    size += node.size;
                    children.push(node);

                    continue;
                }

                if metadata.is_dir() {
                    let child_node = walk(entry.path());
                    size += child_node.size;
                    children.push(child_node);
                    continue;
                }
            }
            Err(e) => {
                panic!("Error: {}", e)
            }
        }
    }

    let absolute_path = fs::canonicalize(path)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    let path = match path.file_name() {
        None => path.to_str().unwrap().to_string(),
        Some(filename) => filename.to_str().unwrap().to_string(),
    };

    return Node {
        path,
        absolute_path,
        size,
        children,
    };
}

#[tauri::command]
fn walk_dirs(dir: &str) -> Node {
    let path = Path::new(&dir);
    walk(path)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![walk_dirs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
