# Baoyu Skills Studio

基于 [baoyu-skills](https://github.com/JimLiu/baoyu-skills) 技能体系产品化的 AI 图像生成创作台。支持封面图、信息图、文章配图、知识漫画、幻灯片、小红书配图六大生成模块，内置积分体系与管理后台。

[English](README.md)

---

## 产品截图

### 登录页

![登录页](docs/screenshots/studio-login.png)

### 创作台

| 封面图 | 信息图 |
|:---:|:---:|
| ![封面图](docs/screenshots/studio-cover-image.png) | ![信息图](docs/screenshots/studio-infographic.png) |

| 文章配图 | 知识漫画 |
|:---:|:---:|
| ![文章配图](docs/screenshots/studio-article-illustrator.png) | ![知识漫画](docs/screenshots/studio-comic.png) |

| 幻灯片 | 小红书配图 |
|:---:|:---:|
| ![幻灯片](docs/screenshots/studio-slide-deck.png) | ![小红书配图](docs/screenshots/studio-xhs-images.png) |

### 作品集

<!-- ![作品集](docs/screenshots/portfolios.png) -->

### 管理后台

| 仪表盘 | 用户管理 |
|:---:|:---:|
| ![仪表盘](docs/screenshots/admin-dashboard.png) | ![用户管理](docs/screenshots/admin-users.png) |

| 生成记录 | API 配置 |
|:---:|:---:|
| ![生成记录](docs/screenshots/admin-generations.png) | ![API配置](docs/screenshots/admin-api-config.png) |

---

## 功能概览

### 六大生成模块

| 模块 | 说明 | 积分消耗 |
|---|---|:---:|
| 封面图 | 文章 / 内容封面，10 种配色 × 7 种渲染风格 | 1 |
| 信息图 | 8 种布局 × 8 种视觉风格，支持横 / 竖 / 方图 | 1 |
| 文章配图 | 按密度生成系列配图（极简 / 均衡 / 按段落 / 丰富） | 2–6 |
| 知识漫画 | 5 种画风 × 6 种基调，支持多种版式 | 4 |
| 幻灯片 | 7 种风格，1–8 张，每张独立生成 | 1 / 张 |
| 小红书配图 | 11 种风格 × 8 种版式，1–6 张系列图 | 1 / 张 |

### 积分体系

- 每次生成消耗对应积分，积分不足时拒绝生成
- 管理员可对任意用户增减积分，并记录操作日志
- 积分明细在「管理后台 → 用户详情」中可查

### 作品集管理

- 每次生成任务异步执行，完成后可在「我的作品集」查看
- 支持按模块筛选、软删除
- 作品详情页支持全屏预览和下载

### 管理后台

- 仪表盘：注册用户数、生成总量、近 14 天趋势图
- 用户管理：搜索、启用 / 禁用、积分调整、查看详情
- 生成记录：全量生成任务列表，可查看状态和错误信息
- API 配置：可视化配置出图 API（支持 GPT Image 2、Banana2、Gemini 及任意 OpenAI 兼容接口），配置实时生效无需重启

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 · Vite · TypeScript · TailwindCSS · Zustand |
| 后端 | FastAPI · SQLAlchemy 2 · Alembic · PyMySQL |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose · Nginx |
| 图像生成 | OpenAI 兼容 API / Google Gemini 原生 API |

---

## 目录结构

```
baoyu-skills-studio/
├── frontend/                  # React 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── studio/        # 6 个生成模块页面
│   │   │   ├── portfolios/    # 作品集列表 & 详情
│   │   │   ├── admin/         # 管理后台（仪表盘、用户、生成记录、API 配置）
│   │   │   └── auth/          # 登录 & 注册
│   │   ├── components/        # 共用 UI 组件
│   │   ├── api/               # Axios 请求封装
│   │   ├── store/             # Zustand 全局状态
│   │   ├── hooks/             # useGenerationPolling 等
│   │   └── layouts/           # AppLayout（侧边栏导航）
│   └── nginx.conf             # 生产环境 Nginx 配置
├── backend/                   # FastAPI 后端
│   ├── app/
│   │   ├── api/               # 路由（auth / generate / portfolios / admin）
│   │   ├── services/
│   │   │   ├── modules/       # 6 个模块的 prompt 构建逻辑
│   │   │   ├── image_gen_service.py   # 统一出图服务（OpenAI / Gemini）
│   │   │   ├── file_service.py        # 图片落盘
│   │   │   └── credits_service.py     # 积分扣减
│   │   ├── models/            # SQLAlchemy ORM 模型
│   │   ├── schemas/           # Pydantic 请求 / 响应模型
│   │   └── core/              # 配置、数据库连接、JWT 鉴权
│   ├── alembic/               # 数据库迁移脚本（001–007）
│   ├── scripts/
│   │   └── create_admin.py    # 初始化管理员账号
│   ├── init.sql               # 等价于 alembic upgrade head 的完整 DDL
│   └── requirements.txt
├── docs/
│   └── screenshots/           # 产品截图（README 引用）
├── docker-compose.yml
├── .env.example               # 环境变量模板
└── README.md
```

---

## 快速开始

### 方式一：Docker 部署（推荐）

**1. 准备环境变量**

```bash
cp .env.example .env
```

编辑 `.env`，至少填写以下字段：

```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_PASSWORD=your_studio_password
JWT_SECRET_KEY=your_long_random_secret    # 建议 64 位随机字符串
IMAGE_MODEL_API_KEY=your_api_key
```

**2. 启动服务**

```bash
docker compose up -d
```

首次启动会自动执行 `alembic upgrade head` 完成建表，无需手动操作。

**3. 初始化管理员账号**

```bash
docker compose exec backend python scripts/create_admin.py
```

默认管理员账号：

| 字段 | 值 |
|---|---|
| 邮箱 | `admin@studio.com` |
| 密码 | `changeme` |

> **首次登录后请立即修改密码。**

**4. 访问**

打开浏览器访问 `http://localhost`（或 `.env` 中 `PORT` 指定的端口）。

---

### 方式二：本地开发

#### 前端

```bash
cd frontend
npm install
npm run dev        # 访问 http://localhost:5173
```

#### 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env    # 填写数据库连接和 API Key
alembic upgrade head    # 建表
uvicorn main:app --port 8700 --reload
```

前端 Vite 开发服务器已配置代理，`/api` 和 `/output` 自动转发到 `http://localhost:8700`。

---

## 环境变量说明

Docker 部署使用根目录 `.env`，本地开发使用 `backend/.env`（字段相同）。

```env
# ── MySQL（Docker 部署必填）──────────────────────────────
MYSQL_ROOT_PASSWORD=change_me_root
MYSQL_DATABASE=baoyu_studio
MYSQL_USER=studio
MYSQL_PASSWORD=change_me_studio

# ── 后端 ─────────────────────────────────────────────────
DATABASE_URL=mysql+pymysql://studio:change_me_studio@db/baoyu_studio
JWT_SECRET_KEY=your-very-long-random-secret   # 至少 32 字符

# ── 图像生成 API（也可通过管理后台可视化配置）────────────
IMAGE_API_MODE=openai              # openai | gemini
IMAGE_MODEL_BASE_URL=              # OpenAI 兼容端点；Gemini 模式留空
IMAGE_MODEL_NAME=gpt-image-2
IMAGE_MODEL_API_KEY=your_api_key

# ── 其他 ─────────────────────────────────────────────────
FRONTEND_URL=http://localhost      # CORS 白名单，改为实际访问地址
PORT=80                            # 对外暴露端口
```

> **API 配置优先级**：管理后台写入数据库的配置 > `.env` 环境变量。修改管理后台配置后立即生效，无需重启容器。

---

## Docker 服务说明

| 服务 | 说明 |
|---|---|
| `db` | MySQL 8.0，数据持久化到 `db_data` volume |
| `backend` | FastAPI，端口仅容器内暴露（8700），生成图片存入 `output_data` volume |
| `frontend` | Nginx 静态托管 React 构建产物，反代 `/api`、`/output` 到后端，对外暴露 `PORT` |

---

## 支持的图像生成 API

管理后台「API 配置」页面提供预设一键填充，也支持任意 OpenAI 兼容接口。

| 预设 | 模式 | 说明 |
|---|---|---|
| GPT Image 2 | OpenAI 兼容 | 官方 `api.openai.com`，`gpt-image-2` 模型 |
| Banana2 | OpenAI 兼容 | 第三方 OpenAI 兼容图像生成服务 |
| Gemini | Gemini 原生 | Google `gemini-2.0-flash-preview-image-generation` |
| 自定义 | 任意 | 手动填写 Base URL、API Key、模型名 |

---

## 数据库迁移

项目使用 Alembic 管理迁移，当前最新版本为 `007`。

```bash
# 升级到最新
alembic upgrade head

# 查看当前版本
alembic current

# 回滚一步
alembic downgrade -1
```

全新部署也可直接导入 `backend/init.sql`，等价于 `alembic upgrade head`。

---

## 部署注意事项

- **国内网络**：`Dockerfile` 已将基础镜像替换为 `docker.m.daocloud.io/` 前缀，国内无需配置代理即可拉取。
- **bcrypt 兼容性**：`requirements.txt` 中已固定 `bcrypt==4.2.1`，bcrypt 5.x 与 passlib 1.7.4 存在不兼容问题，升级依赖时请勿跨大版本。
- **生成超时**：出图 API 请求超时设置为 300 秒，部分模型响应较慢属正常现象。
- **图片存储**：生成的图片存储在 Docker volume `output_data` 中，通过 Nginx `/output` 路径对外提供访问。

---

## License

MIT
