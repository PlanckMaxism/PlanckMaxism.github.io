# Jiahao Chen · 个人学术网站

个人简介、研究方向与固体物理课程 Wiki 的初版架构。

- 网站目标地址：https://planckmaxism.github.io/
- GitHub 仓库：https://github.com/PlanckMaxism/PlanckMaxism.github.io
- 当前内容：简介与研究草案；28 讲 / 56 学时教学进度；13 个章节框架；概念索引与资源入口。
- 未填写：中文姓名、单位、职务、个人照片、正式履历、论文清单、公开邮箱、实际开课安排。

## 网站地图

```text
首页 /
├── 个人简介 /about/
├── 研究方向 /research/
├── 论文与成果 /publications/
└── 固体物理 /teaching/solid-state/
    ├── 教学进度 /syllabus/
    ├── 课程 Wiki /wiki/
    │   ├── 13 个章节页面
    │   └── 概念索引 /concepts/
    └── 学习资源 /resources/
```

导航、页内目录、关联页面与站内搜索已接通。所有内容输出为静态 HTML，移动端可浏览，基础阅读无需 JavaScript；搜索和手机菜单需要 JavaScript。

## 内容与页面如何分工

```text
site.config.json       姓名、简介、站点地址、初版状态
content/
  pages.json           页面登记表：标题、网址、Markdown 文件、页面分组
  course.json          28 讲与 13 章的结构化信息
  about.md             简介
  research.md          研究方向
  publications.md      成果
  course.md            课程首页
  syllabus.md          教学进度表
  concepts.md          概念导航
  resources.md         学习资源
  wiki/chapters/*.md   各章节学生版内容
  _template.md         新页面模板
assets/                样式、交互、原创概念示意图
vendor/                Marked 17.0.5 与许可证
scripts/               构建、检查与本地预览
.github/workflows/     GitHub Pages 自动部署
```

网站使用 Node.js 22+ 和随仓库附带的 Marked。无需 npm install，无后台服务、数据库或第三方搜索服务。`dist/` 是构建产物，不手动编辑，也不提交到 GitHub。

## 本地预览

安装 Node.js 22 或更高版本后，在仓库目录执行：

```sh
npm run build
npm run check
npm run preview
```

打开 http://127.0.0.1:4173 。也可以直接打开构建后 `dist/index.html`，搜索索引不依赖网络请求。

## 日常更新

1. 修改 `content/` 内相应 Markdown 文件，或 `site.config.json` 内的站点信息。
2. 运行 `npm run build` 和 `npm run check`。
3. 预览页面，提交到 `main`。GitHub Actions 会重新构建、检查并发布。

添加新页面时，复制 `content/_template.md`，在 `content/pages.json` 登记一个唯一 `id` 和 `route`。内部链接采用 `[[id|显示文字]]`，例如 `[[wiki/chapters/phonons|声子章节]]`；构建器会检查未登记链接，并生成反向关联。

`course.json` 用于章节地图；`syllabus.md` 用于可编辑进度表。调整课时安排时同时更新两处。`npm run check` 核查 28 讲 / 56 学时、章节覆盖、内部页面和锚点。

初版 Markdown 支持表格、列表和代码块。尚未接入 LaTeX 公式渲染、Obsidian 附件嵌入或 Canvas；这些需要在迁移正式学生版讲义时增加，不能直接将整个 Obsidian 库复制进来。

## GitHub Pages 配置

仓库的 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。工作流在 push 到 main 时自动发布；pull request 只构建与检查。

参考 [GitHub 官方自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

所有站内资源与页面链接使用相对路径，既支持个人根站，也可部署到项目子路径。更换部署地址时更新 `site.config.json` 的 `url`，用于规范链接和 404 返回地址。

## 与现有 Obsidian 教学库衔接

本网站是独立的公开学生入口。初版只依据现有课程设计整理教学进度和章节框架，未导入教师教案、答案、原始教材、来源记录或私人资料，也未修改原库。

建议的更新路径：

```text
原有教师备课库 → 选择并审阅学生版内容 → content/ → 检查与预览 → GitHub Pages
```

这是公开仓库，仓库文件本身也公开。未登记到页面列表的文件仍会在 GitHub 上可见，因此教师答案与私人材料应继续保存在原有独立库中。

## 初版状态与后续扩展

`site.config.json` 中 `draft: true` 会显示初版提示并添加 `noindex`。这仅是搜索引擎提示，不构成访问控制；网站依然公开可访问。内容完成后改为 false，并同步更新页面中的草案文字。

下一阶段可依次完成：正式简介和论文列表、学生版讲义导入、LaTeX 公式、课程 Notebook、英语页面、域名。

`assets/field.svg` 为原创装饰性概念图，不表示真实材料结构或实验结果。第三方 Markdown 解析器许可证见 `vendor/MARKED-LICENSE.md`。未给个人文字与教学内容设置开放许可证。
