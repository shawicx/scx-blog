---
title: '本地化饮食推荐App'
description: '兼顾口味偏好、营养均衡、地域特色与实际可获取性的本地化饮食推荐应用设计方案'
draft: true
published: 2025-11-09
---

---

## 一、核心理念（离线优先 + Rust 全栈）

> Tauri（前端壳 + JS UI） ↔ Rust Core（本地 API / 算法 / 存储）

* 不依赖云，不需要登录鉴权。
* 所有数据与模型在本地（SQLite + JSON + 本地缓存）。
* 后端逻辑与接口由 **Rust** 实现，并直接嵌入 **Tauri** 应用中。


---

## 二、Tauri做前端 + 后端一体

Tauri 的底层架构本质上就是：

* **前端（UI 层）**：HTML / CSS / JS（可用 React、Svelte、Vue 等框架）
* **后端（核心逻辑）**：Rust 编写，通过 **tauri::command** 暴露给前端调用

也就是说，我们可以在同一个项目里：

* 编写 React/Vue 页面；
* 用 Rust 实现“API”逻辑（数据处理、推荐算法、文件存储）；
* 不需要 HTTP 请求 - **不需要服务器**，用函数调用（消息通道）完成通信。

---

## 三、典型架构图（在 Tauri 内部）

```
+---------------------------------------------------+
|                Tauri Application                  |
|---------------------------------------------------|
|  Frontend (React/Vue/Svelte)                      |
|     - 页面路由、UI展示、用户输入                  |
|     - 通过 Tauri.invoke("xxx") 调用 Rust 方法     |
|---------------------------------------------------|
|  Rust Backend                                     |
|     - 数据存储 (SQLite / JSON / TOML)             |
|     - 推荐算法 / 营养计算 / 模型调用              |
|     - 文件/目录管理 (导入/导出数据)               |
|     - LBS / 地图API封装（可调用系统API）         |
|---------------------------------------------------|
|       OS (macOS / Windows / Linux)                |
+---------------------------------------------------+
```

---

## 四、Tauri 内部开发 Rust 后端的方式

在 `src-tauri/src/main.rs` 或单独模块中定义命令：

```rust
#[tauri::command]
fn get_today_recommendations(user_profile: UserProfile) -> Vec<MealPlan> {
    // 从本地 SQLite / JSON 读取数据
    let catalog = load_dishes();
    let recs = recommend(&catalog, &user_profile);
    recs
}
```

前端调用示例（React）：

```ts
import { invoke } from "@tauri-apps/api";

async function loadRecommendations() {
  const recs = await invoke("get_today_recommendations", {
    userProfile: {
      age: 28,
      goal: "keep_fit",
      taste: ["light"],
    },
  });
  console.log(recs);
}
```

---

## 五、数据存储设计（本地）

* **SQLite**：存储用户画像、菜谱、历史记录。
  使用 `rusqlite` 或 `sqlx`。
* **JSON/TOML 文件**：缓存配置、模型权重、语言包。
* **图片/资源文件夹**：存放食谱封面、菜图。

示例：

```
/data/
  ├─ user_profile.json
  ├─ recipes.db
  ├─ models/
  │   ├─ recommend.onnx
  │   └─ nutrition_rules.toml
  └─ cache/
      ├─ today.json
      └─ history.sqlite
```

---

## 六、Rust 后端模块划分（本地版）

```rust
src-tauri/
  ├─ src/
  │   ├─ main.rs                // 启动与命令注册
  │   ├─ api/
  │   │   ├─ recommend.rs       // 推荐逻辑
  │   │   ├─ nutrition.rs       // 营养计算
  │   │   ├─ storage.rs         // SQLite + JSON 读写
  │   │   └─ location.rs        // LBS / 系统地理接口
  │   ├─ model/
  │   │   ├─ dish.rs
  │   │   ├─ user.rs
  │   │   └─ feedback.rs
  │   └─ utils.rs
  └─ Cargo.toml
```

示例命令注册：

```rust
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_today_recommendations,
      update_profile,
      save_feedback
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}
```

---

## 七、推荐逻辑（Rust 本地算法）

先实现规则型（无需机器学习）：

```rust
pub fn recommend(dishes: &[Dish], user: &UserProfile) -> Vec<Dish> {
    dishes.iter()
        .filter(|d| d.kcal < user.daily_limit_kcal())
        .filter(|d| !user.allergies.contains(&d.name))
        .filter(|d| d.tags.iter().any(|t| user.tastes.contains(t)))
        .take(3)
        .cloned()
        .collect()
}
```

未来在本地加载轻量模型（例如 `onnxruntime` for Rust）：

```rust
let session = onnxruntime::session::Session::new(env, "models/recommend.onnx")?;
let output = session.run(vec![input_tensor])?;
```

---

## 八、Tauri + Rust 的优势总结

| 方面       | 优势                                  |
| -------- | ----------------------------------- |
| **性能**   | Rust 原生执行，内存占用极低（比 Electron 少 90%+） |
| **安全**   | 无远程服务，数据本地化，不依赖云                    |
| **开发体验** | JS + Rust 混合，命令式通信（无 HTTP）          |
| **可扩展**  | 未来可添加本地模型推理、文件导入导出、同步模块             |
| **发布方便** | 一次构建，可打包 macOS/Windows/Linux        |

---

## 九、部署与分发

* **桌面端**：直接打包为 `.app` / `.exe` / `.AppImage`
* **移动端（可选）**：使用 [Tauri Mobile](https://tauri.app/v2/guides/development/mobile/)（实验性）
* **数据迁移**：在用户目录下创建独立文件夹，如

  * macOS: `~/Library/Application Support/MyRecipe/`
  * Windows: `%APPDATA%/MyRecipe/`

---

## 十、可选增强方向

* 本地推荐结果缓存（`today.json`，启动秒开）
* 每日推送（本地通知）
* 同步（可选）：未来如要备份，可加一个远程同步 API
* 模型更新机制（下载新版 onnx）

---
