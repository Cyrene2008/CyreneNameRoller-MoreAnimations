# 更多动画 / More Animations

CyreneNameRoller 官方动画扩展，版本 1.1.1，需要插件 API 1.2.0。

Official motion extension for CyreneNameRoller, version 1.1.1. Plugin API 1.2.0 is required.

## 中文

“更多动画”在不接管任何点名、抽奖或公平算法的前提下，为宿主提供一整套高级视觉表现：

- 54 个经过调校的混合 GSAP / WAAPI 非线性动画预设，每个目标提供 9 种机制明显不同的效果。
- 分别配置页面切换、点名结果、发牌、翻牌、抽奖结果与全局氛围动画。
- 动画时长支持 50%–200% 统一调节，并在当前设备持久化。
- OffscreenCanvas 环境视觉层，支持柔和极光、星尘粒子、流光丝带和混合氛围。
- 视觉层响应主题、路由和宿主已确认的抽取结果事件。
- 配置页面完全由宿主原生 Fluent 组件渲染，Web 与 Tauri 共用同一套插件包。
- GSAP 由宿主统一提供并负责取消与清理；插件包不重复携带运行时。
- 仅服从程序内“性能－过渡动画”开关，不会被 Windows 或浏览器的动画效果设置额外关闭；停用时会停止渲染计时器并清空画布。

插件只使用宿主提供的动画注册和只读结果事件。它不能指定抽取结果、修改 CAF 参数、改写统计数据或更改历史记录。

### 动画分类

| 目标 | 预设数量 | 示例 |
| --- | ---: | --- |
| 页面切换 | 9 | 电影幕切、弹性纵深、画廊铰链 |
| 点名结果 | 9 | 磁场锁定、皇家环落、聚光凝结 |
| 发牌 | 9 | 弹簧跃牌、荷官扇发、穹顶落牌 |
| 翻牌 | 9 | 轴心翻面、纸页铰翻、焦点咬合 |
| 抽奖结果 | 9 | 奖台升格、彗星锁奖、冠光降临 |
| 全局氛围 | 9 | 虹膜光场、斜幕流光、纵深脉冲场 |

### 本地开发

```bash
npm install
npm run validate
npm run build
```

打包产物位于 `dist/more-animations-1.1.1.cnrp`。推送版本标签后，仓库内的 Release workflow 会验证版本、构建插件并上传 `.cnrp`，但本地开发不会自动发布。

### 更新日志

- 1.1.1：新增 50%–200% 动画时长调节；页面动画完全替换宿主默认过渡，并改为只服从程序内动画性能开关。
- 1.1.0：升级到 Plugin API 1.2.0，新增宿主 GSAP 动画，扩展为 54 个混合引擎预设，并显著区分剪裁、3D、弹性、轨道、聚光与全局光场机制。
- 1.0.3：视觉层支持性能动画与减少动态效果偏好，停用时完全停止循环，恢复时防重复地重启单一计时器。
- 1.0.2：同步最终定稿的 CyreneNameRoller Plugin SDK 1.1.0，并刷新可复现安装锁文件。
- 1.0.1：兼容性构建标签，未发布 Release。
- 1.0.0：首次发布，提供 36 个动画预设与 OffscreenCanvas 环境视觉层。

## English

More Animations adds a polished presentation layer without taking control of drawing, lottery, history, statistics, or CAF balance logic.

- 54 curated mixed GSAP/WAAPI presets, with nine materially different mechanisms for every target.
- Independent selectors for page transitions, roller results, card dealing, card reveals, lottery results, and global ambience.
- A persistent 50%–200% duration control for every animation provided by this plugin.
- An OffscreenCanvas visual surface with aurora, particles, light ribbons, and a balanced hybrid mode.
- Lifecycle-aware visuals that react to theme, route, and host-confirmed result events.
- A native Fluent settings page rendered by the host on both Web and Tauri.
- GSAP is supplied by the host, which owns cancellation and cleanup; the plugin does not bundle a duplicate runtime.
- Follows only the application's Performance / Transition animations switch, rather than being disabled by Windows or browser motion settings; disabling it stops the render timer and clears the canvas.

The plugin can only register visual definitions and observe approved events. It cannot choose winners, alter candidate weights, change CAF parameters, rewrite statistics, or mutate existing records.

### Development

```bash
npm install
npm run validate
npm run build
```

The package is emitted as `dist/more-animations-1.1.1.cnrp`. The included validation and release workflows follow the official plugin repository conventions.

### Changelog

- 1.1.1: Added a persistent 50%–200% duration control, made page presets fully replace the host transition, and made the in-app performance switch the only animation gate.
- 1.1.0: Upgraded to Plugin API 1.2.0, added host-run GSAP motion, expanded to 54 mixed-engine presets, and introduced clearly distinct clipping, 3D, elastic, orbital, spotlight and ambient-field mechanisms.
- 1.0.3: Added performance-animation and reduced-motion handling with a fully stopped loop and duplicate-safe restart.
- 1.0.2: Synchronized the finalized CyreneNameRoller Plugin SDK 1.1.0 and refreshed the reproducible install lockfile.
- 1.0.1: Compatibility build tag; no Release was published.
- 1.0.0: Initial release with 36 animation presets and an OffscreenCanvas ambient visual surface.

## License

Copyright © Cyrene2008. See `LICENSE`.
