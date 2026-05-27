# baoyu-skills-studio

AI 图像生成创作台，基于 [baoyu-skills](https://github.com/JimLiu/baoyu-skills) 技能体系产品化，支持封面图、信息图、文章配图、知识漫画、幻灯片、小红书配图六大生成模块。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 · Vite · TypeScript · TailwindCSS · Zustand |
| 后端 | FastAPI · SQLAlchemy 2 · Alembic · PyMySQL |
| 图像生成 | Gemini (`gemini-3.1-flash-image-preview`) / OpenAI 兼容 API |

## 目录结构

```
baoyu-skills-studio/
├── frontend/          # React 前端
│   └── src/
│       ├── pages/studio/      # 6 个生成模块页面
│       ├── pages/portfolios/  # 作品集管理
│       ├── pages/admin/       # 管理后台
│       ├── components/        # 共用组件
│       ├── api/               # Axios 请求层
│       ├── store/             # Zustand 状态
│       └── hooks/             # useGenerationPolling 等
└── backend/           # FastAPI 后端
    └── app/
        ├── api/               # 路由（auth/generate/portfolios/admin）
        ├── services/modules/  # 6 个模块的 prompt 逻辑
        ├── models/            # SQLAlchemy ORM
        └── core/              # 配置、数据库、鉴权
```

## 支持的生成模块

| 模块 | 说明 | 积分消耗 |
|---|---|---|
| 封面图 | 文章/内容封面，10 种配色 × 7 种渲染风格 | 1 |
| 信息图 | 8 种布局 × 8 种视觉风格，支持横/竖/方图 | 1 |
| 文章配图 | 按密度生成系列配图（极简/均衡/按段落/丰富） | 2–6 |
| 知识漫画 | 5 种画风 × 6 种基调，支持多种版式 | 4 |
| 幻灯片 | 7 种风格，1–8 张，每张 1 积分 | 1/张 |
| 小红书配图 | 11 种风格 × 8 种版式，1–6 张系列图 | 1/张 |

## 快速开始

### Docker 部署（推荐）

```bash
cp .env.example .env    # 填写数据库密码、JWT_SECRET_KEY、API Key
docker compose up -d    # 首次启动自动执行 alembic upgrade head 建表
```

访问 `http://localhost`（或 `.env` 中 `PORT` 指定的端口）。

创建管理员账号（首次部署）：

```bash
docker compose exec backend python scripts/create_admin.py
```

| 服务 | 说明 |
|---|---|
| `db` | MySQL 8.0，数据持久化到 `db_data` volume |
| `backend` | FastAPI，仅容器内暴露 8700，生成图片存入 `output_data` volume |
| `frontend` | Nginx 静态托管 + 反代 `/api`、`/output` 到后端，对外暴露 `PORT` |

### 本地开发

#### 前端

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

#### 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # 填写数据库和 API Key
alembic upgrade head
uvicorn main:app --port 8700 --reload
```

前端通过 Vite 代理将 `/api` 和 `/output` 转发到 `http://localhost:8700`。

## 环境变量（.env）

Docker 部署使用根目录 `.env`，本地开发使用 `backend/.env`。

```env
# MySQL（Docker 部署必填）
MYSQL_ROOT_PASSWORD=change_me_root
MYSQL_DATABASE=baoyu_studio
MYSQL_USER=studio
MYSQL_PASSWORD=change_me_studio

# 后端
JWT_SECRET_KEY=your-very-long-random-secret

# 图像生成 API
IMAGE_MODEL_API_KEY=your-gemini-or-openai-key
IMAGE_MODEL_BASE_URL=              # OpenAI 兼容端点，Gemini 模式留空
IMAGE_MODEL_NAME=gemini-3.1-flash-image-preview
IMAGE_API_MODE=openai              # openai | gemini

# CORS（改为实际访问地址）
FRONTEND_URL=http://localhost

# 对外端口（默认 80）
PORT=80
```
