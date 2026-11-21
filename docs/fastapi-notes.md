# FastAPI Project Setup Guide

Stack: **FastAPI + Pydantic v2 + PostgreSQL (SQLAlchemy async) + MongoDB (PyMongo async) + Pytest**
Terminal: Git Bash on Windows (CMD/PowerShell differences are noted).
Python: **3.10 or newer** (3.12 recommended).

> Use only the database you need. Postgres and MongoDB parts are independent, so delete the other one's files.

---

## 1. Create the project and virtual environment

```bash
mkdir fastapi-project
cd fastapi-project

python -m venv venv
source venv/Scripts/activate        # Git Bash
# venv\Scripts\activate             # CMD
# venv\Scripts\Activate.ps1         # PowerShell

python -m pip install --upgrade pip
python --version
```

**Output:**
```
Python 3.12.4
```

`(venv)` should appear at the start of your prompt.

---

## 2. Install dependencies

### Core (always)

```bash
pip install fastapi "uvicorn[standard]" pydantic-settings email-validator python-multipart
```

| Package | Why |
|---|---|
| `fastapi` | The framework |
| `uvicorn[standard]` | ASGI server (`[standard]` adds faster reload and websockets) |
| `pydantic-settings` | Read `.env` into a typed `Settings` class |
| `email-validator` | Needed for Pydantic's `EmailStr` |
| `python-multipart` | Needed later for form data and file upload |

### PostgreSQL

```bash
pip install "sqlalchemy[asyncio]" asyncpg alembic
```

| Package | Why |
|---|---|
| `sqlalchemy[asyncio]` | ORM (2.0 style, async) |
| `asyncpg` | Async Postgres driver |
| `alembic` | Database migrations |

### MongoDB

```bash
pip install pymongo
```

`pymongo` (4.9+) has a built-in **async API** (`AsyncMongoClient`). The older `motor` library is deprecated in favour of it, so new projects should use PyMongo async. If you prefer an ODM (like Mongoose), look at `beanie` later.

### Testing

```bash
pip install pytest pytest-asyncio httpx aiosqlite pytest-cov
```

| Package | Why |
|---|---|
| `pytest` | Test runner |
| `pytest-asyncio` | Run `async def` tests |
| `httpx` | Async HTTP client to call the app in tests |
| `aiosqlite` | In-memory SQLite for fast Postgres-route tests |
| `pytest-cov` | Coverage report |

### Save the dependency list

```bash
pip freeze > requirements.txt
```

On another machine or in Docker: `pip install -r requirements.txt`.

---

## 3. Standard folder structure

```
fastapi-project/
├── app/
│   ├── __init__.py
│   ├── main.py                    # app entry point
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py              # Settings from .env
│   ├── db/
│   │   ├── __init__.py
│   │   ├── postgres.py            # engine, session, Base, get_db
│   │   └── mongo.py               # client, database, get_mongo_db
│   ├── models/                    # SQLAlchemy tables (Postgres only)
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/                   # Pydantic models (request / response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── product.py
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py
│           ├── router.py          # combines all routers
│           └── endpoints/
│               ├── __init__.py
│               ├── users.py       # Postgres example
│               └── products.py    # MongoDB example
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # fixtures
│   ├── test_health.py
│   ├── test_users.py
│   └── test_products.py
├── alembic/                       # created by `alembic init`
├── alembic.ini
├── docker-compose.yml             # local Postgres + MongoDB
├── pytest.ini
├── requirements.txt
├── .env
├── .env.example
└── .gitignore
```

**Rule of thumb:**
- `models/` = how data is stored in the database
- `schemas/` = how data looks in the request and response
- `api/` = routes only (thin), no business logic
- `core/` = config, security
- `db/` = connections

Later, when logic grows, add `services/` (business logic) between `api/` and `db/`.

Create the folders:

```bash
mkdir -p app/core app/db app/models app/schemas app/api/v1/endpoints tests
touch app/__init__.py app/core/__init__.py app/db/__init__.py app/models/__init__.py \
      app/schemas/__init__.py app/api/__init__.py app/api/v1/__init__.py \
      app/api/v1/endpoints/__init__.py tests/__init__.py
```

---

## 4. Environment files

**`.env`**
```env
APP_NAME=FastAPI Project
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/appdb
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=appdb
```

**`.env.example`** (same keys, fake values; this one goes to Git)
```env
APP_NAME=FastAPI Project
DEBUG=false
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=dbname
```

**`.gitignore`**
```
venv/
__pycache__/
*.pyc
.env
.pytest_cache/
.coverage
htmlcov/
```

> Never push `.env` to Git. It holds secrets.

---

## 5. Local databases with Docker

**`docker-compose.yml`**
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db

volumes:
  pgdata:
  mongodata:
```

```bash
docker compose up -d        # start both (or: docker compose up -d postgres)
docker compose ps           # check status
docker compose down         # stop (data is kept in volumes)
```

Connect with **MongoDB Compass**: `mongodb://localhost:27017`.
This Mongo has no username/password, which is fine for local development only.

---

## 6. Config (`app/core/config.py`)

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FastAPI Project"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/appdb"

    mongo_url: str = "mongodb://localhost:27017"
    mongo_db_name: str = "appdb"

    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
```

How it works: values come from environment variables or `.env` (names are case-insensitive: `DATABASE_URL` fills `database_url`). If missing, the default is used. Pydantic also checks types, so `DEBUG=abc` raises an error at startup.

---

## 7. App entry point (`app/main.py`)

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.mongo import mongo_client, mongo_db
from app.db.postgres import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- startup ----
    await mongo_db.products.create_index("name")   # remove if you don't use Mongo
    yield
    # ---- shutdown ----
    await engine.dispose()                         # remove if you don't use Postgres
    await mongo_client.close()                     # remove if you don't use Mongo


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="FastAPI starter with Postgres and MongoDB",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
```

> You asked for `app.py`. The convention is `main.py`, but any name works. If you name it `app.py`, run `uvicorn app:app --reload`.

**Router wiring: `app/api/v1/router.py`**
```python
from fastapi import APIRouter

from app.api.v1.endpoints import products, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users.router)
api_router.include_router(products.router)
```

---

## 8. Pydantic schemas

Pydantic validates data coming **in** (request body) and shapes data going **out** (response).

**`app/schemas/user.py`**
```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
```

**`app/schemas/product.py`**
```python
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    price: float = Field(gt=0)
    in_stock: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    price: float | None = Field(default=None, gt=0)
    in_stock: bool | None = None


class ProductRead(ProductCreate):
    id: str
```

**Data sample (valid):**
```json
{"name": "Leon", "email": "leon@example.com"}
```

**Data sample (invalid) and response (status 422):**
```json
{"name": "L", "email": "not-an-email"}
```
```json
{
  "detail": [
    {"type": "string_too_short", "loc": ["body", "name"], "msg": "String should have at least 2 characters"},
    {"type": "value_error", "loc": ["body", "email"], "msg": "value is not a valid email address: ..."}
  ]
}
```
You wrote zero validation code. FastAPI + Pydantic did it from the type hints.

**Why 3 schemas per resource?**

| Schema | Used for | Difference |
|---|---|---|
| `Create` | POST body | No `id` (the database makes it) |
| `Update` | PATCH body | Every field optional |
| `Read` | Response | Has `id`, `created_at`; hides secrets (like password hash) |

---

## 9. PostgreSQL (SQLAlchemy 2.0 async)

### 9.1 Connection (`app/db/postgres.py`)

```python
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
```

### 9.2 Model (`app/models/user.py`)

```python
from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.postgres import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
```

**`app/models/__init__.py`** (so Alembic and tests can see every table)
```python
from app.models.user import User  # noqa: F401
```

### 9.3 Endpoints (`app/api/v1/endpoints/users.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    exists = await db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(**payload.model_dump())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("", response_model=list[UserRead])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.scalars(select(User).order_by(User.id).offset(skip).limit(limit))
    return result.all()


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    await db.delete(user)
    await db.commit()
```

### 9.4 Migrations with Alembic

```bash
alembic init -t async alembic
```

Open `alembic/env.py` and make these changes:

```python
# near the other imports
from app.core.config import settings
from app.db.postgres import Base
import app.models  # noqa: F401  (registers all tables)

# after:  config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

# replace:  target_metadata = None
target_metadata = Base.metadata
```

Then:

```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

**Output:**
```
INFO  [alembic.autogenerate.compare] Detected added table 'users'
INFO  [alembic.runtime.migration] Running upgrade  -> a1b2c3d4e5f6, create users table
```

| Command | Meaning |
|---|---|
| `alembic revision --autogenerate -m "msg"` | Compare models with DB, write a migration file |
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Undo the last migration |
| `alembic current` | Show current version |

> Rule: when you change a model, create a new migration. Don't edit the database by hand.

---

## 10. MongoDB (PyMongo async)

### 10.1 Connection (`app/db/mongo.py`)

```python
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings

mongo_client = AsyncMongoClient(settings.mongo_url)
mongo_db = mongo_client[settings.mongo_db_name]


def get_mongo_db() -> AsyncDatabase:
    return mongo_db
```

MongoDB needs no model class or migration. A collection is created automatically on the first insert. The Pydantic schema is your "schema".

### 10.2 Endpoints (`app/api/v1/endpoints/products.py`)

```python
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import ReturnDocument
from pymongo.asynchronous.database import AsyncDatabase

from app.db.mongo import get_mongo_db
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


def to_object_id(id_: str) -> ObjectId:
    try:
        return ObjectId(id_)
    except InvalidId:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid product id")


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))   # ObjectId is not JSON, so convert to str
    return doc


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncDatabase = Depends(get_mongo_db)):
    doc = payload.model_dump()
    result = await db.products.insert_one(doc)
    return {**payload.model_dump(), "id": str(result.inserted_id)}


@router.get("", response_model=list[ProductRead])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncDatabase = Depends(get_mongo_db),
):
    cursor = db.products.find().sort("_id", 1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [serialize(d) for d in docs]


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: str, db: AsyncDatabase = Depends(get_mongo_db)):
    doc = await db.products.find_one({"_id": to_object_id(product_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return serialize(doc)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: str, payload: ProductUpdate, db: AsyncDatabase = Depends(get_mongo_db)
):
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update")

    doc = await db.products.find_one_and_update(
        {"_id": to_object_id(product_id)},
        {"$set": changes},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return serialize(doc)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db: AsyncDatabase = Depends(get_mongo_db)):
    result = await db.products.delete_one({"_id": to_object_id(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
```

### Postgres vs MongoDB: quick comparison

| | Postgres (SQLAlchemy) | MongoDB (PyMongo) |
|---|---|---|
| Table / collection | Class in `models/` + migration | Created on first insert |
| Primary key | `id: int` | `_id: ObjectId` (convert to `str`) |
| Find one | `await db.get(User, 1)` | `await db.products.find_one({"_id": oid})` |
| Insert | `db.add(obj)` + `commit()` | `await insert_one(doc)` |
| Update | set attributes + `commit()` | `update_one` with `$set` |

---

## 11. Run and try it

```bash
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Open `http://127.0.0.1:8000/docs` for Swagger. Or use curl:

```bash
curl http://127.0.0.1:8000/health
```
```json
{"status":"ok"}
```

```bash
curl -X POST http://127.0.0.1:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Leon", "email": "leon@example.com"}'
```
```json
{"name":"Leon","email":"leon@example.com","id":1,"created_at":"2026-11-21T15:30:00.123456"}
```

```bash
curl -X POST http://127.0.0.1:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Keyboard", "price": 49.99}'
```
```json
{"name":"Keyboard","price":49.99,"in_stock":true,"id":"674f1c2e9a3b4c5d6e7f8a90"}
```

---

## 12. Pytest

### 12.1 Config (`pytest.ini`)

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

`asyncio_mode = auto` means you can write `async def test_...` without a decorator on every test.

### 12.2 Fixtures (`tests/conftest.py`)

```python
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from pymongo import AsyncMongoClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registers tables on Base)
from app.core.config import settings
from app.db.mongo import get_mongo_db
from app.db.postgres import Base, get_db
from app.main import app


# ---------- Postgres routes (tested on in-memory SQLite) ----------
@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        poolclass=StaticPool,                       # one shared in-memory connection
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# ---------- Mongo routes (needs a running MongoDB, uses a separate test DB) ----------
@pytest_asyncio.fixture
async def mongo_client_app():
    mongo = AsyncMongoClient(settings.mongo_url)
    test_db = mongo["test_appdb"]

    app.dependency_overrides[get_mongo_db] = lambda: test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()
    await mongo.drop_database("test_appdb")        # clean up after each test
    await mongo.close()
```

`ASGITransport` talks to the app directly without starting a server, and it does **not** run `lifespan`, so tests never touch your real databases.

### 12.3 Tests

**`tests/test_health.py`**
```python
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

**`tests/test_users.py`**
```python
import pytest

USER = {"name": "Leon", "email": "leon@example.com"}


async def test_create_user(client):
    response = await client.post("/api/v1/users", json=USER)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == USER["email"]
    assert "id" in data


async def test_duplicate_email_returns_409(client):
    await client.post("/api/v1/users", json=USER)
    response = await client.post("/api/v1/users", json=USER)
    assert response.status_code == 409


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "L", "email": "leon@example.com"},       # name too short
        {"name": "Leon", "email": "not-an-email"},        # bad email
        {"name": "Leon"},                                 # email missing
    ],
)
async def test_invalid_payload_returns_422(client, payload):
    response = await client.post("/api/v1/users", json=payload)
    assert response.status_code == 422


async def test_get_user_not_found(client):
    response = await client.get("/api/v1/users/999")
    assert response.status_code == 404


async def test_patch_updates_only_sent_fields(client):
    created = (await client.post("/api/v1/users", json=USER)).json()
    response = await client.patch(f"/api/v1/users/{created['id']}", json={"name": "Leon H"})
    assert response.status_code == 200
    assert response.json()["name"] == "Leon H"
    assert response.json()["email"] == USER["email"]      # unchanged
```

**`tests/test_products.py`** (needs MongoDB running)
```python
async def test_create_and_get_product(mongo_client_app):
    created = await mongo_client_app.post(
        "/api/v1/products", json={"name": "Keyboard", "price": 49.99}
    )
    assert created.status_code == 201
    product_id = created.json()["id"]

    fetched = await mongo_client_app.get(f"/api/v1/products/{product_id}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Keyboard"


async def test_invalid_id_returns_422(mongo_client_app):
    response = await mongo_client_app.get("/api/v1/products/abc")
    assert response.status_code == 422
```

### 12.4 Run

```bash
pytest                               # everything
pytest -v                            # verbose
pytest tests/test_users.py           # one file
pytest -k "duplicate"                # tests whose name contains "duplicate"
pytest -x                            # stop at first failure
pytest --cov=app --cov-report=term-missing
```

**Sample output** (`pytest -v`):
```
tests/test_health.py::test_health PASSED
tests/test_users.py::test_create_user PASSED
tests/test_users.py::test_duplicate_email_returns_409 PASSED
tests/test_users.py::test_invalid_payload_returns_422[payload0] PASSED
tests/test_users.py::test_invalid_payload_returns_422[payload1] PASSED
tests/test_users.py::test_invalid_payload_returns_422[payload2] PASSED
tests/test_users.py::test_get_user_not_found PASSED
tests/test_users.py::test_patch_updates_only_sent_fields PASSED
============ 8 passed in 0.52s ============
```

To skip Mongo tests when Mongo isn't running: `pytest --ignore=tests/test_products.py`.

---

## 13. Common errors

| Error | Cause | Fix |
|---|---|---|
| `uvicorn: command not found` | venv not active | `source venv/Scripts/activate` |
| `ModuleNotFoundError: No module named 'app'` | Wrong folder or missing `__init__.py` | Run from the project root; check `__init__.py` files |
| `Connection refused` on port 5432 | Postgres not running | `docker compose up -d` |
| `InvalidPasswordError` (asyncpg) | `.env` password differs from compose file | Make them match |
| `relation "users" does not exist` | Migration not applied | `alembic upgrade head` |
| `ServerSelectionTimeoutError` | MongoDB not running | `docker compose up -d mongo` |
| `async def functions are not natively supported` | pytest-asyncio missing or `asyncio_mode` not set | Install it; check `pytest.ini` |
| `ImportError: email-validator is not installed` | Missing package | `pip install email-validator` |
| `ValueError: Object of type ObjectId is not JSON serializable` | Returned raw Mongo doc | Use `serialize()` to convert `_id` |

---

## 14. বাংলায় কঠিন অংশগুলো

### `Depends(get_db)` আর `yield`

`get_db` একটা ফাংশন যেটা প্রতিটা request-এর জন্য একটা নতুন DB session খোলে। `yield` পর্যন্ত কোড request শুরুর আগে চলে (session খোলা)। `yield` দিয়ে session endpoint-কে দেওয়া হয়। Endpoint-এর কাজ শেষ হলে `yield`-এর নিচের অংশ চলে (session বন্ধ)। `async with` এই বন্ধ করার কাজটা নিজেই করে, তাই তোমাকে মনে রাখতে হয় না। Express-এ এটা middleware দিয়ে `req.db` বসানোর মতো, কিন্তু এখানে ফাংশনের parameter হিসেবে আসে।

### `lifespan`

App চালু হওয়ার সময় একবার আর বন্ধ হওয়ার সময় একবার কিছু কাজ করার জায়গা। `yield`-এর আগে = startup (index বানানো, connection চেক), `yield`-এর পরে = shutdown (connection বন্ধ করা)। Node-এ `server.listen` এর callback আর `process.on('SIGTERM')` মিলিয়ে যা করতে, এখানে একটা জায়গায় হয়।

### `from_attributes=True`

SQLAlchemy `User` object একটা সাধারণ dict না, এটা একটা class object। Pydantic ডিফল্টভাবে dict চায়। `from_attributes=True` বলে দেয়: "object থেকে `user.id`, `user.name` এভাবে attribute পড়ে নাও।" এটা না দিলে `response_model=UserRead` দিয়ে ORM object return করলে error আসবে।

### `model_dump(exclude_unset=True)`

PATCH-এ client শুধু যেগুলো পাঠিয়েছে সেগুলোই দরকার। `{"name": "Leon H"}` পাঠালে `exclude_unset=True` শুধু `name` দেয়, `email` দেয় না। এটা না দিলে `email: None` ধরে নিয়ে database-এর email মুছে যেত।

### `dependency_overrides`

Test-এ আসল database ছোঁয়া যাবে না। `app.dependency_overrides[get_db] = override_get_db` বলে: "যেখানেই `get_db` লাগবে, তার বদলে আমার বানানো test session দাও।" Endpoint-এর কোড একটুও বদলাতে হয় না। এটাই `Depends` ব্যবহার করার সবচেয়ে বড় সুবিধা।

### `StaticPool` (conftest-এ)

In-memory SQLite প্রতিটা নতুন connection-এ একটা ফাঁকা database দেয়। `StaticPool` বলে: "সবসময় একটাই connection ব্যবহার করো।" তাহলে table বানানো আর পরের query একই database-এ হয়।

### `to_object_id`

MongoDB-র `_id` একটা `ObjectId` object, সাধারণ string না। URL থেকে আসা `"674f1c..."` string-কে `ObjectId(...)` দিয়ে বদলাতে হয়। ভুল string হলে `InvalidId` error আসে, আমরা সেটা ধরে 422 দিই (500 না)।

---

## 15. Setup checklist

- [ ] `python -m venv venv` + activate
- [ ] `pip install` (core, তারপর Postgres/Mongo, তারপর testing)
- [ ] Folder structure + `__init__.py`
- [ ] `.env`, `.env.example`, `.gitignore`
- [ ] `docker compose up -d`
- [ ] `config.py`, `main.py`, `router.py`
- [ ] schemas, models, endpoints
- [ ] `alembic init -t async alembic` + `env.py` edit + `upgrade head`
- [ ] `uvicorn app.main:app --reload` + `/docs` চেক
- [ ] `pytest.ini`, `conftest.py`, tests
- [ ] `pytest` সব green
- [ ] `pip freeze > requirements.txt`

## Next steps (when you're ready)

1. `services/` layer (business logic alada)
2. Password hashing + JWT auth + `api/deps.py` (`get_current_user`)
3. Custom exception handlers
4. Dockerfile for the app + `docker-compose` with the app service
5. Logging, rate limiting, CI with GitHub Actions
