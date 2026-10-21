# Diwen (Steven) Xu — personal homepage

https://rwby-aloupeep.github.io

用 Jekyll 写的个人主页，由 GitHub Pages 直接构建，推送到 `master` 后几分钟内自动上线。不依赖任何第三方主题。

## 常见修改

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、邮箱、GitHub、LinkedIn、座右铭 | `_config.yml` 里的 `author` |
| 首页自我介绍 | `_pages/home.md` 的正文 |
| 首页开场文字（Welcome to my story.） | `_pages/home.md` 的 `hero` |
| 导航菜单、首页目录、章节顺序 | `_data/navigation.yml` |
| 教育经历 / 荣誉 | `_data/education.yml` / `_data/honors.yml` |
| 研究经历 | `_data/experience.yml` |
| 研究方向标签 | `_pages/research.md` 的 `topics` |
| 兴趣爱好卡片 | `_pages/life.md` 的 `interests` |
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
2. 在 `_data/navigation.yml` 的 `chapters` 里按顺序加一项。菜单、首页目录和上一章 / 下一章链接会自动更新。

### 换照片

照片放在 `images/`，每张都有 JPEG 和 WebP 两种格式、两种尺寸（例如 `homepage.jpg` 2400px 宽、`homepage-1200.jpg` 1200px 宽，WebP 同理）。请先缩小再上传，不要直接传相机原图（原来的原图有 29 MB）。

## 目录结构

```
_config.yml        站点设置和个人信息
_data/             导航、经历、笔记等数据
_pages/            各个页面（home、study、research、life、acks、contact、404）
_layouts/          default（外框）、home（首页）、page（章节页）
_includes/         页头、页脚、时间线、笔记卡片、图标等组件
_sass/             样式：tokens（配色、字体）、base、layout、components、chapter、home
assets/css/        样式入口 main.scss
assets/js/         site.js（主题切换、手机菜单）、stars.js（首页星星动画）
files/             笔记 PDF
images/            照片、网站图标、社交分享预览图（og.jpg）
```

配色在 `_sass/_tokens.scss` 里统一定义，亮色和暗色各一套。

## 本地预览

需要 Ruby 3.x：

```sh
bundle install
bundle exec jekyll serve
```

然后打开 http://localhost:4000 。也可以用仓库里的 `docker-compose.yaml` 或 Dev Container。
