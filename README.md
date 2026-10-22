# Diwen (Steven) Xu — personal homepage

https://rwby-aloupeep.github.io

用 Jekyll 写的个人主页，由 GitHub Pages 直接构建，推送到 `master` 后几分钟内自动上线。不依赖任何第三方主题，也不加载任何外部资源（字体都放在仓库里）。

仓库需要保持 **public**：免费账号的私有仓库不能发布 GitHub Pages，改成 private 时网站会被自动下线；再改回 public 后，要到 Settings → Pages 把 Source 重新设为 “Deploy from a branch”、分支 `master`、目录 `/ (root)`，网站才会重新上线。

## 常见修改

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、邮箱、GitHub、LinkedIn、座右铭 | `_config.yml` 里的 `author`（改了 GitHub 或 LinkedIn，同一文件的 `social.links` 也要跟着改） |
| 首页自我介绍 | `_pages/home.md` 的正文 |
| 首页开场文字（Welcome to my story.） | `_pages/home.md` 的 `hero` |
| 导航菜单、首页的章节卡片、章节顺序 | `_data/navigation.yml` |
| 首页章节卡片里列出的内容 | `_includes/previews/` 里对应章节的文件（数据仍来自 `_data/` 和各页面） |
| 教育经历 / 荣誉 | `_data/education.yml` / `_data/honors.yml` |
| 研究经历 | `_data/experience.yml` |
| 研究方向标签 | `_pages/research.md` 的 `topics` |
| 兴趣爱好卡片 | `_pages/life.md` 的 `interests`（`brief` 是首页卡片上的简短版） |
| 章节题词（引言） | 各页面 front matter 里的 `epigraph` |

### 添加一份新笔记

1. 把 PDF 上传到 `files/`，例如 `files/Linear-Algebra.pdf`。
2. 在 `_data/notes.yml` 对应的主题下加两行：

   ```yaml
       - title: "Linear Algebra"
         file: "Linear-Algebra.pdf"
   ```

   新主题就新增一个 `- topic:` 块。

### 添加一个新章节

1. 在 `_pages/` 新建 Markdown 文件，写好 `title`、`permalink`，可选 `epigraph`。
2. 在 `_data/navigation.yml` 的 `chapters` 里按顺序加一项。带编号的章节写 `numeral`（页面上显示为 “Chapter IV”），不编号的（如序章、尾声）写 `label`（例如 `"Interlude"`）。菜单、首页和上一章 / 下一章链接会自动更新。带编号的章节在首页显示为卡片，默认显示 `summary`；想在卡片里列出具体内容，就在 `_includes/previews/` 里加一个文件，并在这一项里写 `preview: 文件名`（不带 `.html`）。不编号的章节在卡片下方显示为一条横栏。

### 换照片

照片放在 `images/`，每张都有 JPEG 和 WebP 两种格式、两种尺寸（例如头像 `avatar.jpg` 960px 宽、`avatar-480.jpg` 480px 宽，WebP 同理）。请先缩小再上传，不要直接传相机原图（原来的原图有 29 MB）。

## 目录结构

```
_config.yml        站点设置和个人信息
_data/             导航、经历、笔记等数据
_pages/            各个页面（home、study、research、life、acks、contact、404）
_layouts/          default（外框）、home（首页）、page（章节页）
_includes/         页头、页脚、时间线、笔记卡片、图标等组件；previews/ 是首页章节卡片的内容
_sass/             样式：tokens（配色、字体）、base、layout、components、chapter、home
assets/css/        样式入口 main.scss
assets/fonts/      网页字体 Cormorant Garamond、Source Serif 4（及其 OFL 许可证）
assets/js/         site.js（主题切换、手机菜单）、stars.js（首页星星动画）
files/             笔记 PDF
images/            照片、网站图标、社交分享预览图（og.jpg）
.github/workflows/ 自动检查（见下）
```

配色在 `_sass/_tokens.scss` 里统一定义：默认是紫黑色的深色主题，另有一套浅色，访客可以用页头右上角的按钮切换。字体在 `_sass/_fonts.scss` 里声明，文件放在 `assets/fonts/`，不从 Google Fonts 加载（Google Fonts 在中国大陆无法访问）。

## 自动检查

每次推送到任何分支，GitHub Actions 都会用和 GitHub Pages 相同的组件构建一遍网站，并检查所有站内链接、图片和脚本是否都指向存在的文件（例如笔记 PDF 的文件名写错）。结果在仓库的 Actions 页面里的 “Check site”；出错时 GitHub 会发邮件提醒。这一步只做检查，不影响网站发布。

## 本地预览

需要 Ruby 3.x：

```sh
bundle install
bundle exec jekyll serve
```

然后打开 http://localhost:4000 。如果构建时报 `invalid byte sequence in US-ASCII`，在命令前加 `LANG=C.UTF-8`。

也可以不装 Ruby，用 Docker：在仓库目录运行 `docker compose up`，同样打开 http://localhost:4000 ；或者在 VS Code 里用 “Reopen in Container” 打开 Dev Container。
