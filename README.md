# 更多动画 / More Animations

CyreneNameRoller 官方动画扩展，版本 1.0.3，需要插件 API 1.1.0 final。

Official motion extension for CyreneNameRoller, version 1.0.3. The final Plugin API 1.1.0 SDK is required.

## 中文

“更多动画”在不接管任何点名、抽奖或公平算法的前提下，为宿主提供一整套高级视觉表现：

- 36 个经过调校的非线性 WAAPI 动画预设。
- 分别配置页面切换、点名结果、发牌、翻牌、抽奖结果与全局氛围动画。
- OffscreenCanvas 环境视觉层，支持柔和极光、星尘粒子、流光丝带和混合氛围。
- 视觉层响应主题、路由和宿主已确认的抽取结果事件。
- 配置页面完全由宿主原生 Fluent 组件渲染，Web 与 Tauri 共用同一套插件包。
- 无 GSAP 或其他运行时动画依赖。
- 尊重宿主性能动画与系统“减少动态效果”偏好；停用时会停止渲染计时器并清空画布，而不是在后台空转。

插件只使用宿主提供的动画注册和只读结果事件。它不能指定抽取结果、修改 CAF 参数、改写统计数据或更改历史记录。

### 动画分类

| 目标 | 预设数量 | 示例 |
| --- | ---: | --- |
| 页面切换 | 6 | 丝绸滑移、景深门廊、玻璃聚焦 |
| 点名结果 | 6 | 光环绽放、冠冕弹跳、晶体聚合 |
| 发牌 | 6 | 层叠浮现、扇面入场、磁吸归位 |
| 翻牌 | 6 | 铰链揭晓、棱镜翻光、流光转面 |
| 抽奖结果 | 6 | 大奖绽放、极光揭晓、星群跃现 |
| 全局氛围 | 6 | 环境脉冲、极光呼吸、流光横扫 |

### 本地开发

```bash
npm install
npm run validate
npm run build
```

打包产物位于 `dist/more-animations-1.0.3.cnrp`。推送版本标签后，仓库内的 Release workflow 会验证版本、构建插件并上传 `.cnrp`，但本地开发不会自动发布。

### 更新日志

- 1.0.3：视觉层支持性能动画与减少动态效果偏好，停用时完全停止循环，恢复时防重复地重启单一计时器。
- 1.0.2：同步最终定稿的 CyreneNameRoller Plugin SDK 1.1.0，并刷新可复现安装锁文件。
- 1.0.1：兼容性构建标签，未发布 Release。
- 1.0.0：首次发布，提供 36 个动画预设与 OffscreenCanvas 环境视觉层。

## English

More Animations adds a polished presentation layer without taking control of drawing, lottery, history, statistics, or CAF balance logic.

- 36 curated WAAPI presets with non-linear easing.
- Independent selectors for page transitions, roller results, card dealing, card reveals, lottery results, and global ambience.
- An OffscreenCanvas visual surface with aurora, particles, light ribbons, and a balanced hybrid mode.
- Lifecycle-aware visuals that react to theme, route, and host-confirmed result events.
- A native Fluent settings page rendered by the host on both Web and Tauri.
- No GSAP or runtime animation dependency.
- Honors host performance-animation and reduced-motion preferences by stopping its render timer and clearing the canvas while visuals are unavailable.

The plugin can only register visual definitions and observe approved events. It cannot choose winners, alter candidate weights, change CAF parameters, rewrite statistics, or mutate existing records.

### Development

```bash
npm install
npm run validate
npm run build
```

The package is emitted as `dist/more-animations-1.0.3.cnrp`. The included validation and release workflows follow the official plugin repository conventions.

### Changelog

- 1.0.3: Added performance-animation and reduced-motion handling with a fully stopped loop and duplicate-safe restart.
- 1.0.2: Synchronized the finalized CyreneNameRoller Plugin SDK 1.1.0 and refreshed the reproducible install lockfile.
- 1.0.1: Compatibility build tag; no Release was published.
- 1.0.0: Initial release with 36 animation presets and an OffscreenCanvas ambient visual surface.

## License

Copyright © Cyrene2008. See `LICENSE`.
