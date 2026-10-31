# Ronnsquare 首页 clone — 分段计划

目标：https://ronnsquare.fr/en/ 首页一模一样（启动动画、内容、图片、字体、字号、动画、交互、desktop + mobile）。
只做英文；语言切换保留 EN；跳转其他页面的链接点击后不导航（`href="#"` + `preventDefault`）。

## 决定

- 字体：用原站 N27 + Gambetta（woff2 放 `public/fonts/`），仅本地学习用，不公开部署。
- 图片 / logo / SVG：从原站下载到 `public/images/`、`public/svg/`，仅本地学习用。
- 参考资料（不提交）：`.scratch/homepage-clone/reference/`
  - `home-en.html` 原站首页 HTML（每个 `section.block-1-*` 的结构和文案）
  - `css/style.css` 原站全部 CSS（字号、间距、断点、颜色）
  - `js/*.js` 原站动画源码（GSAP + Lenis，每个区块一个 `block-1-*-anim-*.js`；启动动画在 `home-*.js`、`brand-clone-*.js`、`wordmark-reveal-*.js`、`preloader-data-*.js`）
- 断点对照：原站 `(min-width: 48em)` 为 desktop。验收尺寸：1440×900、1024×768、375×812。

## 流程（每一部分）

1. 实现：子 agent 按参考资料实现该部分，**不 commit**。
2. 验证：在 browser 里原站 vs 本地并排比对（desktop + mobile：字号、间距、图片、动画时序、hover/点击交互），`pnpm build` + `pnpm lint` 通过。
3. Review：差异列表 → 修复 → 再比对。
4. 交给人：说明改了什么 + 建议的 commit message；人在 browser 确认后自己 commit，再开始下一部分。

## 部分

| #   | 部分                                                                                    | 原站区块                                            | 建议 commit                                                       |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| 0   | 字体、logo、Lenis 平滑滚动、header 复核                                                 | header-ronn, lenis                                  | `chore(assets): use original fonts, logo and lenis smooth scroll` |
| 1   | Hero                                                                                    | block-1-1-hero                                      | `feat(hero): build hero section`                                  |
| 2   | 启动动画（preloader、wordmark、grid reveal、logo 飞到 hero 再缩进 header、header 入场） | site-loader, brand-clone, transition, home entrance | `feat(intro): add homepage entrance animation`                    |
| 3   | Our latest projects 跑马灯                                                              | block-1-2-running-line                              | `feat(running-line): ...`                                         |
| 4   | Quote（pin + fly-in）                                                                   | block-1-3-quote                                     | `feat(quote): ...`                                                |
| 5   | Preoccupations（shapes）                                                                | block-1-4-preoccupations                            | `feat(preoccupations): ...`                                       |
| 6   | Advantages（wipe chain）                                                                | block-1-5-advantages                                | `feat(advantages): ...`                                           |
| 7   | Theses + Services（totem）                                                              | block-1-7-theses, block-1-7-services                | `feat(services): ...`                                             |
| 8   | Projects                                                                                | block-1-8-projects                                  | `feat(projects): ...`                                             |
| 9   | Card reviews                                                                            | block-1-9-card-reviews                              | `feat(reviews): ...`                                              |
| 10  | CTA + FAQ                                                                               | block-1-10-cta, block-1-11-faq                      | `feat(faq): ...`                                                  |
| 11  | Footer（map、nav、newsletter）                                                          | footer-ronn                                         | `feat(footer): ...`                                               |
| 12  | 整页验收（全部尺寸、滚动全程、启动动画、reduced-motion）                                | —                                                   | 按需 `fix(...)`                                                   |

## 进度

- [x] Header（已提交 b29b764）
- [ ] 0 … 12
