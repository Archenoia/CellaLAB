---
name: cella_lab_frontend_template
overview: 为 Cella LAB 合成菌群数据库开发一套基于 HTML+JavaScript+JSON 的前端模板（含首页、搜索、搜索结果、合成菌群、宏基因组、泛基因组、通路、基因共 8 类页面），沿用现有 views/${./includes/} 模板机制，所有图表基于 echarts（下载到本地 vendor），学术纸质报告风格 light 主题，并以 JSON 模拟后台 API 响应。
design:
  architecture:
    framework: html
  styleKeywords:
    - Academic
    - Light Theme
    - Flat Design
    - Paper Report Texture
    - Low Saturation
    - Serif Headings
  fontSystem:
    fontFamily: Source Sans Pro
    heading:
      size: 28px
      weight: 600
    subheading:
      size: 18px
      weight: 600
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#1F4E79"
      - "#2E7D5B"
      - "#C77D3A"
    background:
      - "#FAF8F3"
      - "#FFFFFF"
      - "#F0EDE4"
    text:
      - "#2B2B2B"
      - "#5A5A5A"
      - "#1F4E79"
    functional:
      - "#2E7D5B"
      - "#C0392B"
      - "#B8860B"
      - "#8E44AD"
todos:
  - id: add-echarts-vendor
    content: 下载 echarts/echarts-gl/echarts-wordcloud 至 vendor/echarts 并本地引用
    status: completed
  - id: update-includes
    content: 更新 head/nav/footer 引入 academic.css 与 echarts，补充导航菜单
    status: completed
    dependencies:
      - add-echarts-vendor
  - id: build-academic-theme
    content: 编写 styles/academic.css 学术纸质报告主题样式
    status: completed
    dependencies:
      - update-includes
  - id: write-api-json
    content: 编写 api_demo 下 8 个页面模拟 JSON 数据契约
    status: completed
  - id: build-charts-js
    content: 编写 javascript/charts.js 封装饼/柱/树/热图/graph/3D/词云
    status: completed
    dependencies:
      - add-echarts-vendor
  - id: build-home-search
    content: 实现 home.html 与 search.html 及对应 JS
    status: completed
    dependencies:
      - build-charts-js
      - write-api-json
  - id: build-search-result
    content: 实现 search_result.html 六类聚合与筛选及 JS
    status: completed
    dependencies:
      - build-charts-js
      - write-api-json
  - id: build-consortium-metagenome
    content: 实现 consortium.html 与 metagenome.html 及 JS
    status: completed
    dependencies:
      - build-charts-js
      - write-api-json
  - id: build-pangenome-pathway-gene
    content: 实现 pangenome/pathway/gene.html 及 JS
    status: completed
    dependencies:
      - build-charts-js
      - write-api-json
  - id: add-controllers
    content: 在 index.php 新增 8 个页面控制器路由映射
    status: completed
    dependencies:
      - build-home-search
      - build-search-result
      - build-consortium-metagenome
      - build-pangenome-pathway-gene
---

## 用户需求

开发一个名为 Cella LAB（微生物实验室）的合成菌群数据库前端展示系统，存储并展示四类核心数据：合成菌群、宏基因组测序结果（MAGs/基因注释/环境信息）、泛基因组分析结果、代谢通路。目标是为使用者提供合成菌群设计理论支撑。

## 产品概述

基于现有 PHP 模板机制（views/${./includes/xxx.html} 引用、index.php 控制器路由、wwwroot 为 src），构建一套学术风格、light 主题、平面化、纸质报告质感的前端模板。所有图表基于 echarts 实现，数据通过本地 JSON 模拟 API 响应，便于后续对接后台。

## 核心功能

1. **网站首页**：介绍数据库内容，展示四类数据模块、统计概览与导航入口。
2. **数据库搜索页**：提供关键词搜索框，并带有热点搜索下拉建议框。
3. **搜索结果页**：聚合合成菌群、物种分类、基因、环境样本、酶、代谢通路六类结果，支持按类别筛选。
4. **合成菌群展示页**：群落组成饼/柱状图、菌株代谢能力三维 UMAP 散点图、菌株交叉喂养网络图（拮抗/营养互补/营养竞争/跨菌株合成通路）、菌群功能描述。
5. **宏基因组样本展示页**：群落组成饼/柱状图、MAGs 层次聚类树、注释基因列表、相关通路列表、基因主题词云、样本信息。
6. **泛基因组分析页**：基因家族分类比例图（核心/软核心/壳/云基因）、泛基因组曲线、PAV 矩阵热图、SV 结构变异、共线性分析、基因家族详情。
7. **通路数据页**：通路名称/描述/基因/代谢物/反应列表、网络图可视化、上下游通路、关联菌群/合成菌群/宏基因组样本。
8. **基因数据页**：基因名、所属基因家族、关联菌株/宏基因组样本/合成菌群、代表性序列、PFAM 结构域、所处通路。

## 技术栈选择

- 前端视图：HTML + PHP 模板变量（沿用现有 `${./includes/xxx.html}` 与 `{$title}` 机制）
- 样式：Bootstrap 5 + 自定义 CSS（src/resources/styles），学术 light / 平面 / 纸质报告质感
- 脚本：原生 JavaScript + echarts 5（含 echarts-gl 三维、echarts-wordcloud 词云），放置于 src/resources/javascript
- 第三方库：下载 echarts、echarts-gl、echarts-wordcloud 至 src/resources/vendor（离线本地引用）
- 模拟数据：JSON 文件置于 src/resources/assets/api_demo
- 路由：在 src/index.php 中新增控制器方法映射页面

## 实现方案

### 总体策略

沿用现有 Landify 模板的 include 机制与 Bootstrap 栅格体系，复用 head/nav/footer 组件，新增 8 个视图页面 + 对应 JS 渲染模块 + 模拟 API JSON。每个详情页通过 `fetch` 本地 JSON 初始化 echarts 图表，搜索/筛选交互由各自 JS 模块驱动。

### 关键技术决策

1. **echarts 本地化**：vendor 中无 echarts，需下载 echarts.min.js、echarts-gl.min.js、echarts-wordcloud.min.js 到 vendor/echarts/，在 head.html 或各页 footer 前统一引用，保证离线预览。
2. **图表封装**：在 javascript/ 下建立 `charts.js` 通用封装（饼/柱/树/热图/graph/3D散点/词云），各页 JS 调用统一接口，降低重复代码、便于主题统一。
3. **JSON 数据契约**：为每个页面定义清晰 JSON 结构（与后续后台 API 对齐），页面 JS 读取 `assets/api_demo/{page}.json` 渲染。
4. **学术主题 CSS**：新建 `styles/academic.css`，定义纸质背景纹理、平面卡片、细边框、衬线标题、低饱和配色，覆盖 main.css 的营销风。
5. **路由扩展**：在 index.php 增加 consortium/metagenome/pangenome/pathway/gene/search/searchResult 等控制器，复用 View::Display() 渲染对应 views 文件。

### 性能与可靠性

- 图表按需初始化，页面卸载时 `dispose` 避免内存泄漏；热图/大数组采用 echarts 内置采样。
- JSON 为静态小文件，fetch 失败给出占位提示，不阻塞页面渲染。
- 复用 Bootstrap 栅格与现有 vendor，避免重复引入造成体积膨胀。

## 实现注意事项

- 保持 views 页面 `head.html` 中 `{$title}`、`footer.html` 中 `{$footer_info_txt}` 变量不被破坏。
- 新页面 include 路径严格使用 `${./includes/head.html}`、`${./includes/nav.html}`、`${./includes/footer.html}`。
- 页面级 JS/CSS 在 footer include 之后或 head 中按依赖顺序引用；echarts 须在页面图表脚本之前加载。
- 网络图、三维散点、词云依赖 echarts-gl / echarts-wordcloud，下载后验证文件存在再引用。
- 导航 nav.html 需补充数据库相关菜单（搜索、合成菌群、宏基因组、泛基因组、通路、基因）。

## 架构设计

```mermaid
graph TD
    A[index.php 控制器] -->|路由映射| B[views/*.html 视图]
    B -->|include| C[includes/head.html nav.html footer.html]
    B -->|引用| D[styles/academic.css main.css]
    B -->|引用| E[javascript/{page}.js charts.js]
    E -->|fetch| F[assets/api_demo/*.json]
    E -->|调用| G[vendor/echarts/*]
    G -->|渲染| H[页面图表容器]
```

## 目录结构

```
src/
├── index.php                         # [MODIFY] 新增 consortium/metagenome/pangenome/pathway/gene/search/searchResult 等控制器方法
├── resources/
│   ├── vendor/echarts/
│   │   ├── echarts.min.js            # [NEW] echarts 主库（本地引用）
│   │   ├── echarts-gl.min.js         # [NEW] 三维散点/曲面支持
│   │   └── echarts-wordcloud.min.js  # [NEW] 词云支持
│   ├── javascript/
│   │   ├── charts.js                 # [NEW] echarts 图表通用封装（饼/柱/树/热图/graph/3D/词云）
│   │   ├── home.js                   # [NEW] 首页统计与模块渲染
│   │   ├── search.js                 # [NEW] 搜索页热点下拉与提交
│   │   ├── search-result.js          # [NEW] 结果聚合与类别筛选
│   │   ├── consortium.js             # [NEW] 合成菌群页图表（组成/UMAP/网络/功能）
│   │   ├── metagenome.js             # [NEW] 宏基因组页（组成/聚类树/基因/通路/词云）
│   │   ├── pangenome.js              # [NEW] 泛基因组页（比例/曲线/PAV/ SV/共线性）
│   │   ├── pathway.js                # [NEW] 通路页（列表/网络/关联）
│   │   └── gene.js                   # [NEW] 基因页（序列/PFAM/通路）
│   ├── styles/
│   │   └── academic.css              # [NEW] 学术 light/平面/纸质报告主题样式
│   ├── images/
│   │   └── (SVG 图标)                # [NEW] 各页使用的 svg 图标资源
│   └── assets/api_demo/
│       ├── home.json                 # [NEW] 首页统计与模块数据
│       ├── search_hot.json           # [NEW] 热点搜索词
│       ├── search_result.json        # [NEW] 六类聚合搜索结果
│       ├── consortium.json           # [NEW] 合成菌群组成/UMAP/网络/功能
│       ├── metagenome.json           # [NEW] MAGs/基因/通路/词云/样本
│       ├── pangenome.json            # [NEW] 基因家族/曲线/PAV/SV/共线性
│       ├── pathway.json              # [NEW] 通路详情与关联
│       └── gene.json                 # [NEW] 基因详情
views/
├── includes/
│   ├── head.html                     # [MODIFY] 增加 academic.css 与 echarts vendor 引用
│   ├── nav.html                      # [MODIFY] 补充数据库相关导航菜单
│   └── footer.html                   # [MODIFY] 确保 main.js 与图表脚本顺序（或页面自引）
├── home.html                         # [MODIFY] 重写为数据库介绍首页
├── search.html                       # [NEW] 搜索页
├── search_result.html                # [NEW] 搜索结果页
├── consortium.html                   # [NEW] 合成菌群展示页
├── metagenome.html                   # [NEW] 宏基因组样本展示页
├── pangenome.html                    # [NEW] 泛基因组分析页
├── pathway.html                      # [NEW] 通路数据页
└── gene.html                         # [NEW] 基因数据页
```

## 设计风格

采用学术研究报告风格（Academic Paper / Light / Flat）。整体以纸质报告质感为核心：浅灰/米白背景模拟纸张，细 1px 边框分隔区块，平面化无重阴影，标题使用衬线字体增强文献感，正文使用无衬线保证可读性。图表配色采用低饱和学术色板（蓝/绿/橙/灰），与 echarts 默认高饱和形成区分。

## 页面规划（8 页）

1. **首页 home.html**：Hero 介绍区 + 四类数据卡片导航 + 数据库统计概览（纯数字/条形）+ 最新收录列表 + 页脚。
2. **搜索页 search.html**：居中大搜索框，聚焦时下拉展示热点搜索词（标签云样式），下方展示分类入口卡片。
3. **搜索结果页 search_result.html**：顶部搜索状态条，左侧类别筛选侧栏（六类带计数），右侧结果卡片列表（按类分组），可切换视图。
4. **合成菌群页 consortium.html**：标题区（功能描述）+ 群落组成饼图 + 三维 UMAP 散点 + 交叉喂养网络图（图例区分四类关系）+ 菌株表格。
5. **宏基因组页 metagenome.html**：样本信息卡 + 群落组成图 + MAGs 层次聚类树 + 注释基因表格 + 通路列表 + 基因主题词云。
6. **泛基因组页 pangenome.html**：基因家族比例环图 + 泛基因组累加曲线 + PAV 热图 + SV/共线性示意图 + 基因家族明细表。
7. **通路页 pathway.html**：通路描述 + 代谢物/反应/基因列表 + 通路网络图 + 上下游通路链 + 关联菌群/样本卡片。
8. **基因页 gene.html**：基因概览 + 代表性序列（等宽字体块）+ PFAM 结构域条 + 关联对象卡片 + 所处通路网络。

## 交互与响应式

- 卡片 hover 轻微边框高亮与背景渐变；图表容器响应式 resize。
- 桌面优先（wwwroot 预览），栅格在平板/手机自动堆叠。
- 使用 Bootstrap 5 栅格 + 自定义学术卡片组件，保持全站一致。