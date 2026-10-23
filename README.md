# Diwen (Steven) Xu — personal homepage

https://rwby-aloupeep.github.io

用 Jekyll 写的个人主页，由 GitHub Pages 直接构建，推送到 `master` 后几分钟内自动上线。不依赖任何第三方主题，也不加载任何外部资源（字体都放在仓库里）。

整个网站就是一页：开场和自我介绍之后，各章（Study、Research、Life、Acknowledgments、Contact）依次排下来，顶部菜单点哪章就滚到哪章。旧网址 `/study/`、`/research/`、`/life/`、`/acks/`、`/contact/`、`/cv/`、`/resume/`、`/about/` 都会自动跳到这一页的对应位置。

仓库需要保持 **public**：免费账号的私有仓库不能发布 GitHub Pages，改成 private 时网站会被自动下线；再改回 public 后，要到 Settings → Pages 把 Source 重新设为 “Deploy from a branch”、分支 `master`、目录 `/ (root)`，网站才会重新上线。

## 常见修改

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、邮箱、GitHub、LinkedIn | `_config.yml` 里的 `author`（改了 GitHub 或 LinkedIn，同一文件的 `social.links` 也要跟着改） |
| 首页自我介绍 | `_pages/home.md` 的正文 |
| 首页开场文字（Welcome to my story.） | `_pages/home.md` 的 `hero` |
| 某一章的内容 | `_chapters/` 里对应的文件（study、research、life、acks、contact） |
| 章节顺序、菜单里的名字 | 各章文件开头的 `order`（排序）和 `nav`（菜单里的短名，默认用 `title`） |
| 教育经历 / 荣誉 | `_data/education.yml` / `_data/honors.yml` |
| 研究经历 | `_data/experience.yml` |
| 研究方向标签 | `_chapters/research.md` 的 `topics` |
| 兴趣爱好卡片 | `_chapters/life.md` 的 `interests` |
| 章节题词（引言） | 各章文件开头的 `epigraph` |

### 添加一份新笔记

1. 把 PDF 上传到 `files/`，例如 `files/Linear-Algebra.pdf`。
2. 在 `_data/notes.yml` 对应的主题下加两行：

   ```yaml
       - title: "Linear Algebra"
         file: "Linear-Algebra.pdf"
   ```

   新主题就新增一个 `- topic:` 块。

### 添加一个新章节

在 `_chapters/` 新建一个 Markdown 文件，例如 `_chapters/projects.md`：

```yaml
---
order: 3.5        # 排在第几：这里是 Research（2）和 Life（3）之后
numeral: "IV"     # 带编号的章节显示为 “Chapter IV”；不编号的写 label: "Interlude"
title: Projects
epigraph:         # 可选
  quote: "…"
  author: "…"
---
```

下面写正文（Markdown，小标题用 `###`）。它会按 `order` 出现在首页，菜单里也会自动多一项，地址是 `/#projects`（取自文件名）。编号要自己改，后面各章的 `numeral` 记得顺延。

### 换照片

照片放在 `images/`，每张都有 JPEG 和 WebP 两种格式、两种尺寸（例如头像 `avatar.jpg` 960px 宽、`avatar-480.jpg` 480px 宽，WebP 同理）。请先缩小再上传，不要直接传相机原图（原来的原图有 29 MB）。

## 目录结构

```
_config.yml        站点设置和个人信息
_chapters/         各章的内容，首页按 order 依次显示
_data/             经历、荣誉、笔记等数据
_pages/            home（首页的开场和自我介绍）、404，以及把旧网址跳到首页对应章节的跳转页
_layouts/          default（外框）、home（首页）、page（404 页）
_includes/         页头、页脚、时间线、笔记列表、卡片、图标等组件
_sass/             样式：tokens（配色、字体）、base、layout、components、chapter、home
assets/css/        样式入口 main.scss
assets/fonts/      网页字体 Cormorant Garamond、Source Serif 4（及其 OFL 许可证）
assets/js/         site.js（主题切换、手机菜单、菜单高亮当前章节）、stars.js（首页星星动画）
files/             笔记 PDF
images/            照片、网站图标、社交分享预览图（og.jpg）
.github/workflows/ 自动检查（见下）
```

配色在 `_sass/_tokens.scss` 里统一定义，紫黑色的深色和浅紫色的浅色各一套。网站跟随访客系统（浏览器）的深浅色设置自动切换；访客用页头右上角的按钮手动选过之后，就一直用他选的那套。字体在 `_sass/_fonts.scss` 里声明，文件放在 `assets/fonts/`，不从 Google Fonts 加载（Google Fonts 在中国大陆无法访问）。

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
