# 🐳 Docker সম্পূর্ণ নোটস

> **কীভাবে ব্যবহার করবো**
> - নতুন প্রজেক্ট শুরু → **সেকশন ১৪ (চেকলিস্ট)**
> - কোনো কমান্ড ভুলে গেছি → **সেকশন ১৫ (চিট শিট)**
> - Error আসছে → **সেকশন ১৩ (সমস্যা ও সমাধান)**
> - নির্দিষ্ট স্ট্যাক (FastAPI, React, Next.js, Mongo, Postgres) → **সেকশন ১১**
>
> সব কমান্ড **Git Bash (Windows)**-এর জন্য লেখা। WSL/Linux-এ `//app`-এর বদলে `/app` লিখবো (সেকশন ৫.৪)।

---

## সূচিপত্র

**পর্ব ১ — শুরু**
1. Docker কী, Image vs Container
2. Windows-এ Installation

**পর্ব ২ — Image ও Container**

3. Container কমান্ড
4. Image: Dockerfile, `.dockerignore`, Build, Push, Pull

**পর্ব ৩ — ডেটা ও কনফিগ**

5. Volumes ও Bind Mount (+ hot reload)
6. `.env` ফাইল

**পর্ব ৪ — Networking**

7. Networking ও DNS

**পর্ব ৫ — Multi-container ও টুলস**

8. Docker Compose
9. Utility Container
10. VS Code Dev Container

**পর্ব ৬ — রেসিপি**

11. স্ট্যাক অনুযায়ী Dockerize (FastAPI, React, Next.js, MongoDB, PostgreSQL + Prisma)

**পর্ব ৭ — রেফারেন্স**

12. Cleanup
13. সমস্যা ও সমাধান
14. নতুন প্রজেক্ট চেকলিস্ট
15. চিট শিট

**পর্ব ৮ — পরের ধাপ**

16. Kubernetes পরিচিতি ও প্রস্তুতি

---

# পর্ব ১ — শুরু

## ১. Docker কী, Image vs Container

**Docker** অ্যাপ আর তার সব dependency (Node version, প্যাকেজ, OS লাইব্রেরি) একটা প্যাকেটে বন্ধ করে রাখে। সেই প্যাকেট যেকোনো মেশিনে একইভাবে চলে।

**কেন লাগে:**
- "আমার মেশিনে তো চলে!" সমস্যা শেষ।
- MongoDB, Postgres, Redis PC-তে install না করেই চালানো যায়।
- যে image লোকালি টেস্ট করেছি, সার্ভারেও ঠিক সেটাই চলে।

| | **Image** | **Container** |
|---|---|---|
| কী | read-only ব্লুপ্রিন্ট | Image থেকে তৈরি চলমান instance |
| OOP দিয়ে | `class` | `new` দিয়ে বানানো object |
| তৈরি হয় | `docker build` / `docker pull` | `docker run` |
| ডেটা | বদলায় না | লিখতে পারে, কিন্তু container মুছলে হারায় (volume ছাড়া) |

> 💡 Image হলো রান্নার রেসিপি, Container হলো রান্না করা খাবার। এক রেসিপি থেকে অনেকবার রান্না করা যায়, তেমনি এক image থেকে অনেক container চালানো যায়।

---

## ২. Windows-এ Installation

1. PowerShell (Admin) খুলে চালাও: `wsl --install -d Debian`, তারপর রিস্টার্ট করে Debian-এ user সেট করো।
2. **Docker Desktop for Windows** install করো (এর সাথে Docker Compose-ও আসে)।
3. Settings → General → **Use the WSL 2 based engine** চালু করো।
4. Settings → Resources → **WSL Integration** → Debian চালু করো।

```bash
wsl -l -v
docker --version
docker compose version
```
```
  NAME              STATE      VERSION
* Debian            Running    2
  docker-desktop    Running    2
Docker version 27.3.1, build ce12230
Docker Compose version v2.29.7
```

> 💡 **WSL কেন লাগে:** Container চলে Linux kernel-এর ফিচারের উপর। Windows-এ Linux kernel নেই, তাই WSL 2 একটা হালকা Linux চালায়, আর Docker তার উপর কাজ করে।

---

# পর্ব ২ — Image ও Container

## ৩. Container কমান্ড

| কাজ | কমান্ড |
|---|---|
| চালাও | `docker run -d -p 5000:5000 --name my-api ts-docker` |
| চলমান container | `docker ps` |
| সব container (বন্ধগুলোসহ) | `docker ps -a` |
| থামাও / চালু / রিস্টার্ট | `docker stop my-api` / `docker start my-api` / `docker restart my-api` |
| মোছো | `docker rm my-api` (চলমান হলে `-f`) |
| Logs | `docker logs -f my-api` (`--tail 20` দিলে শেষ ২০ লাইন) |
| ভেতরে শেল | `docker exec -it my-api sh` |

**`docker run`-এর ফ্ল্যাগ:**

| ফ্ল্যাগ | মানে |
|---|---|
| `-d` | ব্যাকগ্রাউন্ডে চালাও |
| `-p HOST:CONTAINER` | পোর্ট ম্যাপ। `5001:5000` মানে ব্রাউজারে `localhost:5001`, ভেতরে অ্যাপ চলে `5000`-এ |
| `--name` | container-এর নাম |
| `--rm` | বন্ধ হলে container অটো মুছে যায় (সাথে তার anonymous volume-ও) |
| `-w` | ভেতরের working directory |
| `-v` | volume / bind mount (সেকশন ৫) |
| `-e` / `--env-file` | env ভেরিয়েবল (সেকশন ৬) |
| `--network` | কোন network-এ যুক্ত হবে (সেকশন ৭) |
| `-it` | interactive terminal |

**উদাহরণ:**
```bash
docker run -d -p 5000:5000 --name my-api ts-docker
docker ps
docker logs my-api
```
```
3f7a9c2b1e4d8f6a0b5c...
CONTAINER ID   IMAGE       STATUS         PORTS                    NAMES
3f7a9c2b1e4d   ts-docker   Up 3 seconds   0.0.0.0:5000->5000/tcp   my-api
Server running on port 5000
```

> 💡 `docker run` প্রতিবার **নতুন** container বানায়। `docker start` **পুরনো** বন্ধ container আবার চালায়।

---

## ৪. Image: Dockerfile, `.dockerignore`, Build, Push, Pull

### ৪.১ Dockerfile (Node + TypeScript backend)

```dockerfile
FROM node:20                 # বেস image
WORKDIR /app                 # ভেতরের কাজের ফোল্ডার
COPY package*.json ./        # আগে শুধু package ফাইল (cache-এর জন্য)
RUN npm install              # build-এর সময় একবার চলে
COPY . .                     # বাকি কোড
EXPOSE 5000                  # শুধু ডকুমেন্টেশন, পোর্ট খুলতে -p লাগবেই
CMD ["npm", "run", "dev"]    # container চালু হলে প্রতিবার চলে
```
**`package.json`:**
```json
{ "scripts": { "dev": "ts-node-dev --respawn --transpile-only --poll src/server.ts" } }
```

> 💡 **আগে `package*.json` কপি করে তারপর বাকি কোড কেন:** Docker প্রতিটা লাইনকে একটা **layer** হিসেবে cache করে। শুধু কোড বদলালে `package.json` বদলায়নি, তাই `npm install` layer cache থেকে আসে, আর build কয়েক সেকেন্ডে শেষ হয়।
>
> 💡 **`RUN` বনাম `CMD`:** `RUN` চলে image **বানানোর** সময়। `CMD` চলে container **চালানোর** সময়।

### ৪.২ `.dockerignore`

```gitignore
node_modules
dist
logs
.env
.env.*
.git
.vscode
.devcontainer
Dockerfile*
```
- `node_modules` বাদ না দিলে Windows-এর প্যাকেজ Linux container-এ ঢুকে যায়, ফলে native প্যাকেজ (bcrypt, prisma) ভাঙে।
- `.env` বাদ না দিলে secret image-এর ভেতরে ঢোকে। Docker Hub-এ push করলে সবাই দেখতে পাবে ⚠️

### ৪.৩ Build, Tag, Push, Pull, Save/Load

```bash
docker build -t ts-docker-image:v2 .                       # build (tag না দিলে "latest")
docker tag ts-docker-image:v2 <hub-user>/ts-docker-image:v2 # Docker Hub-এর জন্য নাম
docker login
docker push <hub-user>/ts-docker-image:v2
docker pull <hub-user>/ts-docker-image:v2                   # অন্য মেশিন/সার্ভারে
docker save -o app.tar ts-docker-image:v2                    # ইন্টারনেট ছাড়া শেয়ার
docker load -i app.tar
docker images
```
```
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm install
 => naming to docker.io/library/ts-docker-image:v2
v2: digest: sha256:4a1c... size: 2210
Loaded image: ts-docker-image:v2
REPOSITORY                  TAG   IMAGE ID       SIZE
<hub-user>/ts-docker-image  v2    a1b2c3d4e5f6   1.12GB
ts-docker-image             v2    a1b2c3d4e5f6   1.12GB   ← একই ID, শুধু আরেকটা নাম
```

| ফ্ল্যাগ | কাজ |
|---|---|
| `-t name:tag` | নাম ও ভার্সন |
| `.` | build context (Dockerfile যে ফোল্ডারে আছে) |
| `-f Dockerfile.dev` | আলাদা নামের Dockerfile ব্যবহার |
| `--build-arg KEY=val` | build-time ভেরিয়েবল (সেকশন ১১) |

---

# পর্ব ৩ — ডেটা ও কনফিগ

## ৫. Volumes ও Bind Mount

> 💡 **সমস্যা দুটো:** (১) container মুছলে ভেতরের ডেটা হারিয়ে যায়। (২) কোড বদলালে প্রতিবার rebuild করা ঝামেলা। Volume প্রথম সমস্যা সমাধান করে, bind mount দ্বিতীয়টা।

### ৫.১ তিন ধরনের তুলনা

| ধরন | সিনট্যাক্স | ডেটা কোথায় | কখন |
|---|---|---|---|
| **Named volume** | `-v ts-docker-logs:/app/logs` | Docker ম্যানেজ করে | DB ডেটা, logs, যা স্থায়ী রাখতে চাই |
| **Anonymous volume** | `-v /app/node_modules` | Docker, র‍্যান্ডম নামে | bind mount থেকে কোনো ফোল্ডার "রক্ষা" করতে |
| **Bind mount** | `-v "$(pwd)":/app` | আমার PC-র আসল ফোল্ডারে | ডেভেলপমেন্টে লাইভ কোড এডিট |

### ৫.২ একসাথে ব্যবহার (আমার dev কমান্ড)

```bash
docker run -p 5000:5000 --name ts-container --rm -w //app \
  -v ts-docker-logs://app/logs \
  -v "//$(pwd)"://app \
  -v //app/node_modules \
  --env-file .env ts-docker:v3
```
```
/app                 ← bind mount: আমার প্রজেক্ট ফোল্ডার (লাইভ)
├── src/
├── package.json
├── node_modules/    ← anonymous volume (container-এর নিজের Linux প্যাকেজ)
└── logs/            ← named volume ts-docker-logs (স্থায়ী)
```

> 💡 **`-v /app/node_modules` কেন:** Bind mount পুরো `/app`-কে আমার PC-র ফোল্ডার দিয়ে ঢেকে দেয়, ফলে image-এ install করা `node_modules`-ও ঢাকা পড়ে যায়। Anonymous volume বলে দেয়, "এই ফোল্ডারটা container-এর নিজেরটাই থাকবে।" নিয়ম হলো: বেশি নির্দিষ্ট path (`/app/node_modules`) কম নির্দিষ্ট path (`/app`)-এর উপর জয়ী হয়।

> ⚠️ Bind mount শুধু **ডেভেলপমেন্টে**। প্রোডাকশনে কোড image-এর ভেতরেই থাকে (`COPY . .`)।

### ৫.৩ Volume কমান্ড
```bash
docker volume ls
docker volume inspect ts-docker-logs
docker volume rm ts-docker-logs
```
```
DRIVER    VOLUME NAME
local     ts-docker-logs
local     4c9e1f2a7b...        ← anonymous
"Mountpoint": "/var/lib/docker/volumes/ts-docker-logs/_data"
```

### ৫.৪ Windows path সমস্যা: `//` কেন

Git Bash `/app` দেখলে ভাবে এটা Windows path, আর বদলে `C:/Program Files/Git/app` বানিয়ে ফেলে। `//app` লিখলে এই রূপান্তর হয় না।

| টার্মিনাল | bind mount লেখার ধরন |
|---|---|
| Git Bash | `-v "//$(pwd)"://app` |
| WSL / Linux / Mac | `-v "$(pwd)":/app` |
| PowerShell | `-v ${PWD}:/app` |
| CMD | `-v %cd%:/app` |
| **Docker Compose** | `./folder:/app` (কোনো ঝামেলা নেই ✅) |

### ৫.৫ Hot reload: polling কেন লাগে

Windows ফোল্ডার bind mount করলে "ফাইল বদলেছে" সিগন্যাল (inotify) container-এর ভেতরে পৌঁছায় না। তাই watcher-কে **polling** চালু করতে হয়, মানে কিছুক্ষণ পরপর নিজেই চেক করবে।

| টুল | কী যোগ করবো |
|---|---|
| ts-node-dev | `--poll` |
| nodemon | `-L` (`--legacy-watch`) |
| Next.js | env `WATCHPACK_POLLING=true` |
| Vite | `server.watch.usePolling: true` |
| uvicorn (FastAPI) | env `WATCHFILES_FORCE_POLLING=true` |

```
[INFO] 10:45:03 Restarting: /app/src/server.ts has been modified
Server running on port 5000
```

> 💡 প্রজেক্ট WSL-এর ফাইলসিস্টেমে (`~/projects/...`) রাখলে polling লাগে না, আর সবকিছু দ্রুত চলে।

---

## ৬. `.env` ফাইল

**নিয়ম:** `.env` কখনো image-এ যাবে না (`.dockerignore`-এ রাখো)। Run করার সময় বাইরে থেকে দেবো।

```bash
docker run --env-file ./.env ts-docker:v3          # পুরো ফাইল
docker run -e PORT=5000 -e NODE_ENV=dev ts-docker  # আলাদা আলাদা
docker exec ts-container printenv PORT             # চেক
```
```
5000
```

> ⚠️ `--env-file`-এ ভ্যালুর চারপাশে quote দিও না। `KEY="value"` লিখলে quote-সহই পৌঁছায়।
> ⚠️ DB URL-এ কোন hostname লিখবো, সেটা নির্ভর করে DB কোথায় চলছে তার উপর। দেখো সেকশন ৭.৬।

---

# পর্ব ৪ — Networking

## ৭. Networking ও DNS

> 💡 **মূল কথা:** প্রতিটা container একটা আলাদা ছোট কম্পিউটারের মতো, যার নিজের IP আর নিজের `localhost`। তাই container-এর ভেতরে `localhost` মানে container **নিজে**, আমার PC না।

### ৭.১ Docker network কী

Docker network হলো Docker-এর বানানো একটা ভার্চুয়াল network, অনেকটা বাসার Wi-Fi router-এর মতো। একই network-এর container-রা একে অপরের সাথে কথা বলতে পারে, অন্য network-এরগুলো পারে না।

```
                     ইন্টারনেট
                         ▲  NAT (অটো, কোনো সেটআপ লাগে না)
 ┌───────────────────────┴──────────────────────────┐
 │ আমার PC                                           │
 │  localhost:5000 ──(-p 5000:5000)──┐               │
 │                                   ▼               │
 │  ┌────────── network (gateway 172.18.0.1) ─────┐  │
 │  │  backend 172.18.0.3:5000    mongodb :27017   │  │
 │  └──────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────┘
```
- **Container → ইন্টারনেট:** অটো কাজ করে।
- **PC/ব্রাউজার → container:** শুধু `-p` দিয়ে publish করা পোর্টে।
- **Container → container (একই network):** সরাসরি, `-p` ছাড়াই।

**Driver (ধরন):**

| Driver | কাজ |
|---|---|
| **bridge** | হোস্টের ভেতরে প্রাইভেট network। ডিফল্ট, ৯৯% ক্ষেত্রে এটাই ✅ |
| **host** | Container সরাসরি হোস্টের network ব্যবহার করে (Linux সার্ভারে) |
| **none** | কোনো network নেই |
| **overlay** | একাধিক সার্ভার জুড়ে (Swarm / Kubernetes জগতে) |

### ৭.২ Default `bridge` বনাম নিজের বানানো network

| | Default `bridge` | Custom (`docker network create`) |
|---|---|---|
| Container-এর **নাম** দিয়ে কানেক্ট | ❌ শুধু IP | ✅ |
| Isolation | সব container একসাথে | শুধু ওই network-এর গুলো |
| চলমান অবস্থায় যোগ/বাদ | ❌ | ✅ |

> 💡 **নিয়ম:** প্রতি প্রজেক্টে একটা network রাখবো। Docker Compose এটা অটো করে দেয় (সেকশন ৮)।

### ৭.৩ তিন পরিস্থিতি

**(ক) Container → ইন্টারনেট (যেমন Atlas):** সাধারণ URL দিলেই হবে।
```env
DB_URL=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ts-docker
```

**(খ) Container → আমার PC (PC-তে চলা MongoDB, XAMPP, API):** `localhost`-এর বদলে `host.docker.internal` লিখবো।
```env
DB_URL=mongodb://localhost:27017/ts-docker-local               ❌ ECONNREFUSED
DB_URL=mongodb://host.docker.internal:27017/ts-docker-local    ✅
```
API কলের জন্যও একই নিয়ম: `http://host.docker.internal:5000/api/v1/users`
(খাঁটি Linux সার্ভারে লাগলে run-এ যোগ করতে হয়: `--add-host=host.docker.internal:host-gateway`)

**(গ) Container → container:** দুটোকে একই custom network-এ রেখে **container-এর নাম** দিয়ে কানেক্ট করবো।
```bash
docker network create ts-docker-network
docker run -d --name mongodb --rm --network ts-docker-network -v ts-docker-db:/data/db mongo
docker run ... --network ts-docker-network --env-file .env ts-docker-backend:v5
```
```env
DB_URL=mongodb://mongodb:27017/ts-docker-db
```
> শিখতে গিয়ে প্রথমে IP দিয়ে করেছিলাম (`docker inspect -f '{{.NetworkSettings.IPAddress}}' mongo` থেকে পাওয়া `172.17.0.2`)। কিন্তু IP restart হলে বদলে যায়, তাই রিয়েল প্রজেক্টে সবসময় **নাম** ব্যবহার করবো।

**(ঘ) উল্টো দিক: Backend PC-তে (container ছাড়া), Mongo container-এ:** তখন পোর্ট publish করতে হবে।
```bash
docker run -d --name mongodb -p 27017:27017 -v ts-docker-db:/data/db mongo
```
```env
DB_URL=mongodb://localhost:27017/ts-docker-db
```
(PC-তে আগে থেকে MongoDB চললে পোর্ট conflict হবে, তখন `-p 27018:27017` দাও)

> **এক লাইনের নিয়ম:** বাইরে থেকে (PC বা ব্রাউজার) container-এ ঢুকতে **`-p` লাগে**। একই network-এর container থেকে **লাগে না**।

### ৭.৪ Docker কীভাবে নাম থেকে IP বের করে (DNS)

Custom network-এ Docker একটা DNS সার্ভার চালায়, যার ঠিকানা ভেতর থেকে সবসময় `127.0.0.11`।

```
backend: "mongodb"-এর IP কী?
   → /etc/resolv.conf → nameserver 127.0.0.11 (Docker DNS)
       ├─ network-এ "mongodb" নামে কেউ আছে? → হ্যাঁ → 172.18.0.2
       └─ না (google.com, Atlas) → PC-র DNS-এ পাঠায়
```
তাই একই DNS container-এর নাম আর ইন্টারনেটের নাম দুটোই সামলায়। Default `bridge`-এ এই DNS নেই, তাই সেখানে নাম কাজ করে না।

**চেক করো:**
```bash
docker exec backend cat //etc/resolv.conf
docker exec backend getent hosts mongodb
docker run --rm --network ts-docker-network busybox nslookup mongodb
```
```
nameserver 127.0.0.11
172.18.0.2      mongodb
Server:  127.0.0.11
Name:    mongodb
Address: 172.18.0.2
```
একই container-এর আরেকটা নাম দিতে চাইলে: `--network-alias db`

### ৭.৫ Network কমান্ড

```bash
docker network ls
docker network create ts-docker-network
docker network inspect ts-docker-network       # কোন container যুক্ত, কার কোন IP
docker network connect ts-docker-network app   # চলমান container যোগ
docker network disconnect ts-docker-network app
docker network rm ts-docker-network
docker network prune
```
```
NETWORK ID     NAME                 DRIVER    SCOPE
a1b2c3d4e5f6   bridge               bridge    local
f6e5d4c3b2a1   ts-docker-network    bridge    local
"Containers": { "...": { "Name": "mongodb", "IPv4Address": "172.18.0.2/16" } }
```
> Container যুক্ত থাকা অবস্থায় `rm` করলে error দেয় (`has active endpoints`)। আগে container বন্ধ করতে হবে।

### ৭.৬ সারসংক্ষেপ: কে কোন URL ব্যবহার করবে

| কোড কোথায় চলে | টার্গেট | URL |
|---|---|---|
| Container | ইন্টারনেট / Atlas | সাধারণ URL |
| Container | আমার PC-তে চলা কিছু | `host.docker.internal:<port>` |
| Container | আরেকটা container | `<container বা service নাম>:<ভেতরের port>` |
| আমার PC (Compass, Prisma CLI, লোকাল backend) | container | `localhost:<publish করা port>` |
| **ব্রাউজার** (React, Next client component) | backend container | `localhost:<publish করা port>` বা ডোমেইন ⚠️ container-এর নাম কখনো না |

---

# পর্ব ৫ — Multi-container ও টুলস

## ৮. Docker Compose

### ৮.১ কী এবং কেন

Compose ছাড়া একটা full-stack অ্যাপ চালাতে হয় এভাবে: network বানাও, তারপর Mongo চালাও, তারপর backend build করে run করো, তারপর frontend build করে run করো। প্রতিটা কমান্ড লম্বা, আর **ক্রম মেনে** চালাতে হয় (frontend আগে চালালে হবে না)।

**Docker Compose** এই সবকিছু একটা YAML ফাইলে লিখে রাখে, আর **এক কমান্ডে** (`docker compose up`) সব চালায়। এটা ঠিক `package.json`-এর script-এর মতো: অনেকগুলো কমান্ড একটা ছোট নামের ভেতরে রেখে দেওয়া।

**Compose যা বদলায় না:**
- **Dockerfile** এখনও লাগবে। Compose শুধু বলে কোন Dockerfile থেকে build করতে হবে।
- **Image ও container** একই থাকে। Compose শুধু এগুলো তৈরি আর ম্যানেজ করার কাজ সহজ করে।

**কোথায় ব্যবহার:**
- Compose **একটা মেশিনে** একাধিক container ম্যানেজ করে। সেটা আমার লোকাল PC হতে পারে, বা একটা সার্ভারও (যেমন একটা EC2/VPS-এ পুরো অ্যাপ)।
- যদি সার্ভিসগুলো **অনেক মেশিনে ছড়ানো** থাকে, অটো scaling লাগে, বা একটা ক্র্যাশ করলে অন্য মেশিনে আবার চালাতে হয়, তখন **Kubernetes** লাগে (সেকশন ১৬)।
- DB যদি ক্লাউডে থাকে (Atlas, AWS RDS), তবুও Compose চলে। শুধু DB service-টা Compose ফাইলে থাকবে না, আর `.env`-এ ক্লাউডের URL দেবো।

> 💡 Compose প্রতিটা container-কে একটা **service** বলে।

### ৮.২ ফোল্ডার স্ট্রাকচার

Frontend আর backend একটা parent ফোল্ডারে রাখবো। Compose ফাইল থাকবে root-এ। MongoDB-র জন্য কোনো ফোল্ডার লাগে না, কারণ অফিশিয়াল image ব্যবহার করি।

```
ts-docker/
├── compose.yaml                      ← (docker-compose.yml নামও চলে)
├── docker-with-typescript-backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   └── src/
└── docker-with-nextjs-frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.local
    └── app/
```
> ফোল্ডারের নাম আমার আসল ফোল্ডারের সাথে হুবহু মিলতে হবে। বানান ভুল হলে (`typescipt`) build-এ `path not found` error আসে।

### ৮.৩ `compose.yaml` (আমার প্রজেক্ট, ঠিক করা ভার্সন)

```yaml
services:
  mongodb:
    image: mongo:7
    volumes:
      - ts-docker-db:/data/db
    env_file:
      - ./mongo.env
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      retries: 10

  backend:
    build:
      context: ./docker-with-typescript-backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    volumes:
      - ts-docker-logs:/app/logs                     # named volume
      - ./docker-with-typescript-backend:/app        # bind mount
      - /app/node_modules                            # anonymous volume
    env_file:
      - ./docker-with-typescript-backend/.env
    depends_on:
      mongodb:
        condition: service_healthy

  frontend:
    build:
      context: ./docker-with-nextjs-frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./docker-with-nextjs-frontend:/app           # bind mount
      - /app/node_modules
      - /app/.next
    env_file:
      - ./docker-with-nextjs-frontend/.env.local
    environment:
      - WATCHPACK_POLLING=true
    depends_on:
      - backend

volumes:
  ts-docker-db:
  ts-docker-logs:
```

**আমার প্রথম ভার্সন থেকে যা বদলেছি:**

| আগে | এখন | কেন |
|---|---|---|
| `/app/node-modules` | `/app/node_modules` | বানান ভুল ছিল। ভুল নামে volume হয়, ফলে আসল `node_modules` ঢাকা পড়ে আর অ্যাপ চলে না |
| service নাম `ts-docker-backend-container` | `backend` | ছোট নাম URL-এ লেখা সহজ। পুরনো নামও চলবে, তবে তখন URL-এ সেটাই দিতে হবে |
| Mongo পড়ত backend-এর `.env` | আলাদা `mongo.env` | Backend-এর সব secret (JWT ইত্যাদি) Mongo container-এ যাওয়ার দরকার নেই |
| `image: "mongo"` | `mongo:7` | ভার্সন নির্দিষ্ট রাখলে হঠাৎ বড় আপডেটে কিছু ভাঙে না |
| frontend-এ শুধু bind mount | `node_modules`, `.next` volume + polling | Backend-এর মতো একই কারণ (সেকশন ৫.২, ৫.৫) |
| `depends_on: - mongodb` | `condition: service_healthy` | নিচে ৮.৫-এ ব্যাখ্যা |

### ৮.৪ লাইন-বাই-লাইন ব্যাখ্যা: `docker run` ফ্ল্যাগ ↔ Compose key

| Compose key | কাজ | `docker run`-এ যা ছিল |
|---|---|---|
| `services:` | সব container-এর তালিকা। প্রতিটা key (যেমন `backend`) একটা service | একেকটা `docker run` |
| service-এর নাম (`backend`) | container চেনার নাম, আর **network-এ hostname** | `--name` |
| `image:` | রেডিমেড image থেকে চালাও (Docker Hub) | `docker run mongo` |
| `build.context` | কোন ফোল্ডার থেকে build হবে | `docker build ... .`-এর `.` |
| `build.dockerfile` | সেই ফোল্ডারের কোন Dockerfile | `-f` |
| `ports:` | `"HOST:CONTAINER"` | `-p` |
| `volumes:` (service-এর ভেতরে) | `নাম:/path` = named, `./path:/path` = bind, `/path` = anonymous | `-v` |
| `env_file:` | env ফাইল লোড | `--env-file` |
| `environment:` | আলাদা env ভেরিয়েবল | `-e` |
| `depends_on:` | কোন service আগে চালু হবে | হাতে ক্রম মেনে চালানো |
| `volumes:` (একদম নিচে, top-level) | named volume ঘোষণা। এখানে না লিখলে service-এ ব্যবহার করা যায় না | `docker volume create` |
| (কিছু লাগে না) | network অটো তৈরি হয় | `docker network create` + `--network` |
| (কিছু লাগে না) | `down` দিলে container মুছে যায় | `--rm` |
| (কিছু লাগে না) | কাজের ফোল্ডার Dockerfile-এর `WORKDIR` থেকে আসে | `-w` (চাইলে `working_dir:`) |

> 💡 **YAML-এর নিয়ম:** ইনডেন্টেশন (space) দিয়ে গঠন বোঝানো হয়, **Tab চলবে না**। `-` দিয়ে লিস্ট। পোর্ট সবসময় quote-এ রাখো (`"5000:5000"`), নইলে কিছু সংখ্যা YAML ভুলভাবে পড়ে।

### ৮.৫ Network, service নাম, আর `depends_on`

- Compose অটো একটা network বানায় (`ts-docker_default`), আর সব service সেখানে যুক্ত করে। তাই `--network` লাগে না।
- **Service-এর নামই hostname।** Backend থেকে Mongo-তে যেতে লিখবো `mongodb`, frontend server থেকে backend-এ যেতে লিখবো `backend`।
- Container-এর আসল নাম হয় `<project>-<service>-1` (যেমন `ts-docker-backend-1`)। নির্দিষ্ট নাম চাইলে `container_name: ts-docker-backend` দিতে পারো।

> ⚠️ **`depends_on`-এর সীমা:** সাধারণ `depends_on` শুধু নিশ্চিত করে যে Mongo container **চালু হয়েছে**, কিন্তু Mongo connection নেওয়ার জন্য **তৈরি** কিনা সেটা দেখে না। ফলে backend মাঝে মাঝে আগে কানেক্ট করতে গিয়ে ব্যর্থ হয়। `healthcheck` + `condition: service_healthy` দিলে Compose অপেক্ষা করে যতক্ষণ না Mongo `ping`-এর উত্তর দিচ্ছে।

### ৮.৬ env ফাইলগুলো

**`mongo.env` (root-এ):**
```env
MONGO_INITDB_ROOT_USERNAME=ts-docker
MONGO_INITDB_ROOT_PASSWORD=12345678
```
**`docker-with-typescript-backend/.env`:**
```env
PORT=5000
DB_URL=mongodb://ts-docker:12345678@mongodb:27017/ts-docker-db?authSource=admin
```
| URL-এর অংশ | মানে |
|---|---|
| `ts-docker:12345678` | `mongo.env`-এর সাথে **হুবহু** মিলতে হবে |
| `@mongodb` | Mongo **service-এর নাম** |
| `:27017` | ভেতরের পোর্ট। Mongo-তে `ports:` লাগে না |
| `?authSource=admin` | root user থাকে `admin` DB-তে। না দিলে `Authentication failed` |

**`docker-with-nextjs-frontend/.env.local`:**
```env
API_URL=http://backend:5000                # server-side (container থেকে container)
NEXT_PUBLIC_API_URL=http://localhost:5000  # ব্রাউজার থেকে
```

> ⚠️ **Mongo-র দুটো ফাঁদ:**
> 1. env-এর নাম `MONGO_INITDB_ROOT_USERNAME`, **`MONGODB_...` না**। ভুল নাম দিলে Docker কোনো error দেয় না, আর DB চুপচাপ auth ছাড়াই চলে।
> 2. `MONGO_INITDB_*` শুধু **খালি volume**-এ কাজ করে। আগে auth ছাড়া `ts-docker-db` তৈরি হয়ে থাকলে user তৈরি হবে না। তখন `docker compose down -v` দিয়ে volume মুছে আবার শুরু করো (⚠️ ডেটা হারাবে), অথবা নতুন volume নাম দাও।

### ৮.৭ Frontend-এর API URL: server বনাম browser

| কোথা থেকে fetch | কোথায় চলে | কোন URL |
|---|---|---|
| Server Component, Route Handler, Server Action | frontend container-এর ভেতরে | `API_URL=http://backend:5000` ✅ |
| Client Component (`"use client"`, `useEffect`, বাটন ক্লিক) | **ব্যবহারকারীর ব্রাউজারে** | `NEXT_PUBLIC_API_URL=http://localhost:5000` ✅ |

ব্রাউজার Docker network-এর বাইরে, তাই `backend` নাম চেনে না (`ERR_NAME_NOT_RESOLVED`)।

**`lib/api.ts`:**
```ts
const BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_URL              // server
    : process.env.NEXT_PUBLIC_API_URL  // browser

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/v1/users`, { cache: 'no-store' })
  return res.json()
}
```
```json
{"success":true,"data":[{"_id":"6737b1...","name":"Leon"}]}
```
**Backend-এ CORS** (ব্রাউজার থেকে আসা request-এর জন্য):
```ts
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
```

### ৮.৮ Compose কমান্ড

```bash
docker compose up                 # build (প্রথমবার) + সব চালাও, logs সামনে দেখায়
docker compose up -d              # ব্যাকগ্রাউন্ডে
docker compose up -d --build      # Dockerfile বা package.json বদলালে আবার build
docker compose ps                 # কোনটা চলছে
docker compose logs -f backend    # একটা service-এর লাইভ log
docker compose exec backend sh    # চলমান service-এর ভেতরে শেল
docker compose exec backend npm install zod   # নতুন প্যাকেজ যোগ
docker compose restart backend
docker compose stop               # থামাও (container থাকে, পরে start করা যায়)
docker compose start
docker compose down               # থামাও + container ও network মুছে দাও
docker compose down -v            # + volume মুছে দাও (⚠️ DB ডেটা যাবে)
docker compose down --rmi local   # + Compose-এর build করা image মুছে দাও
```
**`docker compose up -d --build` আউটপুট:**
```
[+] Building 18.4s (19/19) FINISHED
[+] Running 6/6
 ✔ Network ts-docker_default        Created
 ✔ Volume "ts-docker_ts-docker-db"  Created
 ✔ Container ts-docker-mongodb-1    Healthy
 ✔ Container ts-docker-backend-1    Started
 ✔ Container ts-docker-frontend-1   Started
```
**`docker compose ps`:**
```
NAME                   SERVICE    STATUS                 PORTS
ts-docker-backend-1    backend    Up 20 seconds          0.0.0.0:5000->5000/tcp
ts-docker-frontend-1   frontend   Up 18 seconds          0.0.0.0:3000->3000/tcp
ts-docker-mongodb-1    mongodb    Up 26 seconds (healthy) 27017/tcp
```

### ৮.৯ কোন কমান্ডে কী মুছে যায়

| | `stop` | `down` | `down -v` | `down --rmi local` |
|---|---|---|---|---|
| Container | থাকে | মোছে | মোছে | মোছে |
| Network | থাকে | মোছে | মোছে | মোছে |
| Named volume (DB ডেটা) | থাকে | **থাকে** | মোছে | থাকে |
| Anonymous volume | থাকে | থাকে (অব্যবহৃত হয়ে) | মোছে | থাকে |
| Image | থাকে | থাকে | থাকে | Compose-এর build করা গুলো মোছে |

> 💡 `docker run --rm` বন্ধ হওয়ার সাথে সাথে anonymous volume মুছে দেয়। কিন্তু Compose-এ `down` দিলে anonymous volume অব্যবহৃত অবস্থায় থেকে যায়। সেগুলো `down -v` বা `docker volume prune` দিয়ে পরিষ্কার করতে হয়।

### ৮.১০ Compose ছাড়া একই সেটআপ (রেফারেন্স)

এটা জানা দরকার কারণ Compose ভেতরে ঠিক এটাই করে:
```bash
docker network create ts-docker-network

docker run -d --name mongodb --rm --network ts-docker-network \
  -v ts-docker-db:/data/db --env-file mongo.env mongo:7

docker build -t ts-docker-backend:v5 ./docker-with-typescript-backend
docker run -d --name backend --rm --network ts-docker-network -p 5000:5000 \
  --env-file ./docker-with-typescript-backend/.env -w //app \
  -v ts-docker-logs://app/logs \
  -v "//$(pwd)/docker-with-typescript-backend"://app \
  -v //app/node_modules ts-docker-backend:v5

docker build -t ts-docker-frontend:v5 ./docker-with-nextjs-frontend
docker run -d --name frontend --rm --network ts-docker-network -p 3000:3000 \
  --env-file ./docker-with-nextjs-frontend/.env.local -e WATCHPACK_POLLING=true -w //app \
  -v "//$(pwd)/docker-with-nextjs-frontend"://app \
  -v //app/node_modules -v //app/.next ts-docker-frontend:v5
```

---

## ৯. Utility Container

### ৯.১ কী এবং কেন লাগে

**Utility container** হলো এমন container যেটা অ্যাপ চালায় না। এটা শুধু একটা **টুল চালানোর** জন্য, যেমন `npm init`, `npm install`, `npx create-next-app`, `pip`।

**কেন:**
- **ডিম আগে না মুরগি আগে সমস্যা:** নতুন প্রজেক্ট বানাতে `npm init` লাগে, যার জন্য PC-তে Node লাগে। কিন্তু Docker-এর উদ্দেশ্যই হলো PC-তে কিছু install না করা। Utility container এই সমস্যার সমাধান।
- **নির্দিষ্ট ভার্সন:** PC-তে Node 18 থাকলেও Node 20 দিয়ে প্রজেক্ট বানানো যায়, বা ক্লায়েন্টের পুরনো প্রজেক্টে Node 14-এর কমান্ড চালানো যায়, কিছু install বা uninstall না করেই।
- **টিমে সবাই** একই ভার্সনের npm দিয়ে `package-lock.json` তৈরি করে।

### ৯.২ ধাপে ধাপে

**`Dockerfile`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
```

**ধাপ ১ — image build করো:**
```bash
docker build -t node-util .
```

**ধাপ ২ — নতুন প্রজেক্ট ফোল্ডারে গিয়ে container চালাও:**
```bash
mkdir docker-project-with-utility-container && cd docker-project-with-utility-container
docker run --name node-util -w //app -v "//$(pwd)"://app -it --rm -d node-util
```

**ধাপ ৩ — ভেতরে কমান্ড চালাও:**
```bash
docker exec -it node-util npm init -y
docker exec -it node-util npm install express
docker exec -it node-util npm install -D typescript
ls
```
```
Wrote to /app/package.json
added 65 packages in 3s
added 1 package in 1s
node_modules  package-lock.json  package.json      ← আমার PC-র ফোল্ডারে চলে এসেছে ✅
```

### ৯.৩ Bind mount আর `-it` কেন লাগে

**Bind mount (`-v "//$(pwd)"://app`):** `npm init` যে `package.json` বানায়, সেটা তৈরি হয় container-এর `/app` ফোল্ডারে। Bind mount থাকায় `/app` আসলে আমার PC-র ফোল্ডার, তাই ফাইলগুলো সরাসরি আমার প্রজেক্টে চলে আসে। Bind mount না দিলে ফাইলগুলো container-এর ভেতরেই থাকত, আর `--rm` থাকায় container বন্ধ হলেই সব হারিয়ে যেত।

**`-it` + `-d`:** `node` image-এর ডিফল্ট কমান্ড হলো `node`, মানে Node REPL (যেখানে `>` দিয়ে JS লেখা যায়)। কোনো input (stdin) সংযুক্ত না থাকলে REPL সাথে সাথে বন্ধ হয়ে যায়, ফলে container-ও বন্ধ হয়ে মুছে যায়। তখন `docker exec` চালানোর মতো কিছু থাকে না।
- `-i` stdin খোলা রাখে, আর `-t` একটা terminal দেয়। ফলে REPL input-এর অপেক্ষায় চালু থাকে।
- `-d` এটাকে ব্যাকগ্রাউন্ডে পাঠায়, যাতে আমি `docker exec` দিয়ে কমান্ড পাঠাতে পারি।

### ৯.৪ আরও সহজ উপায় (container চালু রাখার দরকার নেই)

**এক কমান্ডে কাজ শেষ, container অটো মুছে যায়:**
```bash
docker run -it --rm -w //app -v "//$(pwd)"://app node-util npm init -y
```

**ENTRYPOINT দিয়ে আরও ছোট:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
ENTRYPOINT ["npm"]
```
```bash
docker build -t npm-util .
docker run -it --rm -v "//$(pwd)"://app npm-util init -y
docker run -it --rm -v "//$(pwd)"://app npm-util install express
```
`ENTRYPOINT` দিলে image নামের পরে যা লিখি সেটা `npm`-এর পরে বসে যায়। `install express` মানে আসলে `npm install express`।

> 💡 `npx create-next-app` বা `create-vite`-এর মতো জিনিসও এভাবে চালানো যায়: `docker run -it --rm -w //app -v "//$(pwd)"://app node:20 npx create-next-app@latest my-app`

### ৯.৫ আমার প্রশ্নের উত্তর: প্যাকেজ install-এর পর utility container চালু রাখবো, নাকি বন্ধ করবো?

**বন্ধ করে দাও।** Utility container শুধু **সেটআপের টুল**, অ্যাপ চালানোর জন্য না।

```bash
docker stop node-util      # --rm থাকায় নিজে থেকেই মুছে যাবে
```
এরপর কাজের ধাপ:
1. **Backend চালাও তার নিজের dev container-এ:** নিজস্ব Dockerfile আর Compose দিয়ে (`docker compose up`)। Utility container-এর সাথে এর কোনো সম্পর্ক নেই।
2. **পরে নতুন প্যাকেজ লাগলে** utility container আবার লাগবে না। চলমান backend container-এর ভেতরেই install করো:
   ```bash
   docker compose exec backend npm install zod
   ```
   `package.json` bind mount হওয়ায় আমার ফোল্ডারেও আপডেট হবে, আর প্যাকেজ container-এর `node_modules` volume-এ যাবে।
3. **Utility container আবার কখন লাগবে:** নতুন প্রজেক্ট শুরু করার সময়, অথবা backend container চালু না থাকা অবস্থায় কোনো এককালীন কমান্ড চালাতে।

> ⚠️ Utility container দিয়ে install করা `node_modules` হলো **Linux** build। Backend সবসময় Docker-এ চালালে কোনো সমস্যা নেই। কিন্তু কখনো Docker ছাড়া Windows-এ সরাসরি `npm run dev` করলে, আর তাতে native প্যাকেজ (bcrypt, prisma) থাকলে, PC-তে আবার `npm install` করতে হবে।

---

## ১০. VS Code Dev Container

VS Code নিজেই container-এর **ভেতরে** চলে, তাই এডিটর, টার্মিনাল আর extension সব container-এর ভেতরে কাজ করে। লম্বা run কমান্ড মনে রাখতে হয় না।

1. **Dev Containers** extension install করো।
2. প্রজেক্ট root-এ `.devcontainer/devcontainer.json` বানাও:

```jsonc
{
  "name": "ts-container",
  "image": "node:20",
  "workspaceMount": "source=${localWorkspaceFolder},target=/app,type=bind",
  "workspaceFolder": "/app",
  "mounts": [
    "source=ts-docker-logs,target=/app/logs,type=volume",
    "target=/app/node_modules,type=volume"
  ],
  "runArgs": [
    "--name", "ts-devcontainer",
    "-p", "5000:5000",
    "--env-file", "${localWorkspaceFolder}/.env",
    "--rm"
  ],
  "postCreateCommand": "npm install"
}
```
3. `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**। নিচে বাম কোণে দেখাবে `>< Dev Container: ts-container`।

| `docker run` | `devcontainer.json` |
|---|---|
| image | `"image"` (নিজের Dockerfile হলে `"build": { "dockerfile": "../Dockerfile" }`) |
| bind mount + `-w` | `workspaceMount` + `workspaceFolder` |
| named/anonymous volume | `mounts` |
| `-p`, `--name`, `--env-file`, `--rm` | `runArgs` |

> 💡 Compose প্রজেক্টে `"dockerComposeFile": "../compose.yaml", "service": "backend"` দিয়ে Compose-এর একটা service-এর ভেতরেই VS Code খোলা যায়।

---

# পর্ব ৬ — রেসিপি

## ১১. স্ট্যাক অনুযায়ী Dockerize

> 💡 **সব স্ট্যাকে একই প্যাটার্ন:**
> 1. আগে dependency ফাইল কপি করে install করো, তারপর কোড কপি করো।
> 2. সার্ভার **`0.0.0.0`**-এ listen করাও। `127.0.0.1`-এ চললে `-p` দিয়ে বাইরে থেকে ঢোকা যায় না।
> 3. Dev mode-এ bind mount + polling, production-এ multi-stage build।

### ১১.১ FastAPI

```
fastapi-app/
├── app/main.py
├── requirements.txt
└── Dockerfile
```
```python
# app/main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI in Docker"}
```
```
# requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
```
```dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
`.dockerignore`: `__pycache__`, `.venv`, `venv`, `.env`, `.git`

**Compose (dev, hot reload):**
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    volumes: ["./:/app"]
    environment: ["WATCHFILES_FORCE_POLLING=true"]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process [1] using WatchFiles
INFO:     Application startup complete.
```
`curl localhost:8000` → `{"message":"Hello from FastAPI in Docker"}` (Swagger পাবে `/docs`-এ)

- `command:` Dockerfile-এর `CMD`-কে override করে। Dev-এ `--reload` যোগ করার জন্য এটা দিয়েছি।
- Node-এর মতো anonymous volume লাগে না, কারণ pip প্যাকেজ `/usr/local/lib/...`-এ install হয়, `/app`-এ না।

### ১১.২ React (Vite)

**Dev:** `vite.config.ts`
```ts
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, watch: { usePolling: true } }
})
```
```dockerfile
# Dockerfile.dev
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```
```yaml
  web:
    build: { context: ./frontend, dockerfile: Dockerfile.dev }
    ports: ["5173:5173"]
    volumes: ["./frontend:/app", "/app/node_modules"]
```
```
  VITE v5.4.8  ready in 412 ms
  ➜  Local:   http://localhost:5173/
```

**Production: multi-stage build + Nginx**
```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
```nginx
# nginx.conf — React Router-এর route-এ রিফ্রেশ করলে 404 না আসার জন্য
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri $uri/ /index.html; }
}
```
```bash
docker build --build-arg VITE_API_URL=http://localhost:5000/api/v1 -t react-prod .
docker run -d -p 8080:80 react-prod
docker images react-prod
```
```
REPOSITORY   TAG      SIZE
react-prod   latest   48.2MB     ← ~1.1GB থেকে ~৫০MB
```

> 💡 **Multi-stage build:** একটা Dockerfile-এ একাধিক `FROM` থাকে। প্রথম stage-এ বড় Node image দিয়ে build করি, তারপর শুধু তৈরি হওয়া ফাইল `COPY --from=build` দিয়ে ছোট Nginx image-এ নিই। শেষ image-এ Node, `node_modules` বা সোর্স কোড কিছুই থাকে না।
>
> ⚠️ `VITE_*` ভেরিয়েবল **build-এর সময়** কোডে বসে যায়। তাই `--build-arg` দিয়ে দিতে হয়, run-এর সময় `--env-file` দিলে কাজ করবে না। এতে secret রাখবে না, কারণ ব্রাউজারে সবাই দেখতে পায়।

### ১১.৩ Next.js

**Dev:** সেকশন ৮.৩-এর frontend service দেখো (Dockerfile ৯.২-এর মতো, শুধু `EXPOSE 3000`)।

**Production:** `next.config.ts`-এ `output: 'standalone'` দাও, তারপর:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```
```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t next-prod .
docker run -d -p 3000:3000 --env-file .env.production next-prod
```
```
  ▲ Next.js 15.0.3
 ✓ Ready in 180ms
```
- **Standalone:** build করলে একটা ছোট `server.js` আর শুধু যে প্যাকেজগুলো আসলে লাগে সেগুলো তৈরি হয়। পুরো `node_modules` image-এ নিতে হয় না।
- `public` আর `.next/static` standalone-এ অটো কপি হয় না। আলাদা করে কপি না করলে ছবি আর CSS আসবে না।

| env | কোথায় চলে | কখন সেট হয় |
|---|---|---|
| `NEXT_PUBLIC_*` | ব্রাউজারে | build-এর সময় (`--build-arg`)। Dev mode-এ `--env-file` দিয়েও চলে |
| বাকি সব (`DB_URL`, `JWT_SECRET`) | server-এ | run-এর সময় (`env_file`) |

### ১১.৪ MongoDB

```yaml
services:
  mongodb:
    image: mongo:7
    ports: ["27018:27017"]          # শুধু Compass/PC থেকে ঢোকার জন্য
    volumes: ["mongo-data:/data/db"]
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secret123
volumes:
  mongo-data:
```
| কে কানেক্ট করছে | URL |
|---|---|
| Container (একই Compose) | `mongodb://admin:secret123@mongodb:27017/mydb?authSource=admin` |
| PC / Compass | `mongodb://admin:secret123@localhost:27018/mydb?authSource=admin` |

```bash
docker compose exec mongodb mongosh -u admin -p secret123
```
```
test> show dbs
admin   100.00 KiB
mydb     40.00 KiB
test> use mydb
mydb> db.users.find()
[ { _id: ObjectId('6731a2...'), name: 'Leon' } ]
```
> PC-তে নিজের MongoDB 27017-এ চললে conflict এড়াতে host পোর্ট 27018 দিয়েছি।

### ১১.৫ PostgreSQL + Prisma

```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5433:5432"]
    volumes: ["pg-data:/var/lib/postgresql/data"]
    environment:
      - POSTGRES_USER=leon
      - POSTGRES_PASSWORD=secret123      # বাধ্যতামূলক, না দিলে container বন্ধ হয়ে যায়
      - POSTGRES_DB=appdb
volumes:
  pg-data:
```
> ⚠️ `POSTGRES_*` শুধু খালি volume-এ কাজ করে। Volume path `/var/lib/postgresql/data` হলো Postgres 16/17-এর জন্য, Postgres 18-এ path বদলেছে। ভার্সন বদলালে অফিশিয়াল image পেজে মিলিয়ে নিও।

```bash
docker compose exec postgres psql -U leon -d appdb
```
```
appdb=# \dt
 Schema | Name | Type  | Owner
--------+------+-------+-------
 public | User | table | leon
```

**Prisma `DATABASE_URL`:**
```env
# PC থেকে (npx prisma migrate dev, prisma studio)
DATABASE_URL="postgresql://leon:secret123@localhost:5433/appdb?schema=public"
# Container থেকে
DATABASE_URL=postgresql://leon:secret123@postgres:5432/appdb?schema=public
```
PC থেকে ঢুকি publish করা পোর্ট `5433` দিয়ে, আর container থেকে ঢুকি ভেতরের পোর্ট `5432` দিয়ে।

**Prisma সহ backend Dockerfile:**
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache openssl          # Prisma engine-এর জন্য লাগে
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```
```
1 migration found in prisma/migrations
All migrations have been successfully applied.
Server running on port 5000
```
- `migrate dev`: PC থেকে চালাই। নতুন migration **তৈরি** করে।
- `migrate deploy`: container বা production-এ চালাই। শুধু তৈরি করা migration **চালায়**।
- ⚠️ `prisma generate` সবসময় Docker-এর **ভেতরে** চালাতে হবে। Windows-এ generate করা client Linux-এ কাজ করে না (`Query engine library not found`)।

---

# পর্ব ৭ — রেফারেন্স

## ১২. Cleanup

```bash
docker system df                # Docker কতটা জায়গা নিচ্ছে
docker container prune          # সব বন্ধ container
docker image prune -a           # কোনো container ব্যবহার করছে না এমন সব image
docker volume prune             # অব্যবহৃত volume (⚠️ ডেটা যাবে)
docker network prune            # অব্যবহৃত network
docker system prune             # বন্ধ container + network + dangling image একসাথে
docker rm -f $(docker ps -aq)   # সব container
docker rmi $(docker images -q)  # সব image
```
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          8         3         4.2GB     2.9GB (69%)
Containers      5         3         12MB      4MB
Local Volumes   6         3         310MB     120MB
```
> চলমান container যে image ব্যবহার করছে সেটা মোছা যায় না। আগে container বন্ধ করো।

---

## ১৩. সমস্যা ও সমাধান

| Error / লক্ষণ | কারণ | সমাধান |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:27017` | container-এর ভেতরে `localhost` | একই network-এ থাকলে service/container-এর নাম, PC-তে থাকলে `host.docker.internal` |
| `getaddrinfo ENOTFOUND mongodb` | আলাদা network, বা নামের বানান ভুল | একই network বা একই Compose ফাইলে রাখো, নাম মিলাও |
| `Authentication failed` | পাসওয়ার্ড অমিল, `authSource=admin` নেই, বা পুরনো volume | URL মিলাও, `?authSource=admin` দাও, `down -v` |
| Auth দিলাম তবুও পাসওয়ার্ড ছাড়া ঢোকা যাচ্ছে | `MONGODB_INITDB_...` (ভুল নাম) | `MONGO_INITDB_ROOT_USERNAME` |
| ব্রাউজারে `ERR_NAME_NOT_RESOLVED` | client-side fetch-এ container-এর নাম | `NEXT_PUBLIC_API_URL=http://localhost:5000` |
| ব্রাউজারে CORS error | backend-এ origin allow করা নেই | `cors({ origin: 'http://localhost:3000' })` |
| ব্রাউজারে "connection reset" | সার্ভার `127.0.0.1`-এ চলছে | `0.0.0.0`-এ চালাও (`--host 0.0.0.0`, `host: true`) |
| ফাইল সেভ করলেও reload হয় না | Windows bind mount | polling চালু করো (সেকশন ৫.৫) |
| `Cannot find module 'express'` | bind mount `node_modules` ঢেকে দিয়েছে, বা volume-এর বানান ভুল | `/app/node_modules` anonymous volume দাও |
| bcrypt/prisma error (`invalid ELF header`) | Windows-এর `node_modules` container-এ ঢুকেছে | `.dockerignore`-এ `node_modules`, ভেতরে install করো |
| `port is already allocated` | ওই পোর্ট আগে থেকে ব্যবহার হচ্ছে | অন্য host পোর্ট দাও (`27018:27017`) |
| `container name "/x" is already in use` | পুরনো container রয়ে গেছে | `docker rm -f x` |
| `unknown shorthand flag: 'n' in -network` | এক ড্যাশ দিয়েছি | `--network` |
| mount ভুল জায়গায় যাচ্ছে (`C:/Program Files/Git/app`) | Git Bash path রূপান্তর | `//app` লেখো (সেকশন ৫.৪) |
| Compose: package যোগ করলেও কাজ করছে না | image পুরনো | `docker compose up -d --build` |
| YAML parse error | Tab বা ভুল ইনডেন্ট | শুধু space ব্যবহার করো |

---

## ১৪. নতুন প্রজেক্ট চেকলিস্ট ✅

- [ ] **১.** প্রজেক্ট নতুন হলে utility container দিয়ে `npm init` আর প্যাকেজ install করো (সেকশন ৯)
- [ ] **২.** ফোল্ডার: root-এ `compose.yaml`, ভেতরে `backend/` আর `frontend/` (সেকশন ৮.২)
- [ ] **৩.** প্রতিটা অ্যাপে `Dockerfile` + `.dockerignore` দাও (`node_modules`, `.env` অবশ্যই বাদ)
- [ ] **৪.** সার্ভার `0.0.0.0`-এ চলবে, আর dev script-এ polling থাকবে (সেকশন ৫.৫)
- [ ] **৫.** env ফাইল:
  - DB URL-এ **service-এর নাম** (`mongodb`, `postgres`)
  - Frontend-এ `API_URL` (service নাম) + `NEXT_PUBLIC_API_URL` (localhost)
  - Mongo env-এর নাম `MONGO_INITDB_*`, পাসওয়ার্ড URL-এর সাথে মিলিয়ে
- [ ] **৬.** সেকশন ৮.৩ থেকে `compose.yaml` কপি করে নাম, পোর্ট আর ফোল্ডার বদলাও
- [ ] **৭.** Backend-এ CORS-এ frontend-এর origin allow করো
- [ ] **৮.** চালাও: `docker compose up -d --build`
- [ ] **৯.** যাচাই: `docker compose ps` (সব Up/healthy), আর `docker compose logs -f backend`-এ "MongoDB connected"
- [ ] **১০.** একটা ফাইল সেভ করো, তারপর log-এ "Restarting" আসছে কিনা দেখো
- [ ] **১১.** নতুন প্যাকেজ লাগলে: `docker compose exec backend npm install <pkg>`
- [ ] **১২.** কাজ শেষে: `docker compose down` (ডেটা থাকে), আর পুরো রিসেট চাইলে `down -v`
- [ ] **১৩.** Deploy-এর জন্য production Dockerfile (multi-stage) বানাও → `docker build` → `docker push`

---

## ১৫. চিট শিট

**Container**

| কাজ | কমান্ড |
|---|---|
| চালাও | `docker run -d -p 5000:5000 --name app img` |
| তালিকা | `docker ps` / `docker ps -a` |
| থামাও / চালু / মোছো | `docker stop app` / `docker start app` / `docker rm -f app` |
| Logs | `docker logs -f app` |
| ভেতরে ঢোকো | `docker exec -it app sh` |

**Image**

| কাজ | কমান্ড |
|---|---|
| Build | `docker build -t img:v1 .` (`-f Dockerfile.dev`, `--build-arg K=V`) |
| Tag / Push / Pull | `docker tag img:v1 user/img:v1` / `docker push ...` / `docker pull ...` |
| Save / Load | `docker save -o img.tar img:v1` / `docker load -i img.tar` |
| তালিকা / মোছো | `docker images` / `docker rmi img:v1` |

**Volume ও Env**

| কাজ | কমান্ড |
|---|---|
| Named / Anonymous / Bind | `-v name:/app/logs` / `-v //app/node_modules` / `-v "//$(pwd)"://app` |
| তালিকা / মোছো | `docker volume ls` / `docker volume rm name` |
| Env | `--env-file .env` / `-e KEY=val` |

**Network**

| কাজ | কমান্ড |
|---|---|
| বানাও / তালিকা / বিস্তারিত | `docker network create net` / `ls` / `inspect net` |
| যোগ / বাদ | `docker network connect net app` / `disconnect` |
| Container → PC | `host.docker.internal` |
| নাম → IP চেক | `docker exec app getent hosts mongodb` |

**Compose**

| কাজ | কমান্ড |
|---|---|
| চালাও | `docker compose up -d` (`--build` দিলে আবার build) |
| অবস্থা / logs | `docker compose ps` / `docker compose logs -f backend` |
| ভেতরে কমান্ড | `docker compose exec backend sh` |
| থামাও | `docker compose stop` / `docker compose down` |
| সব মোছো | `docker compose down -v --rmi local` |

**Utility ও DB shell**

| কাজ | কমান্ড |
|---|---|
| এককালীন npm কমান্ড | `docker run -it --rm -w //app -v "//$(pwd)"://app node:20 npm init -y` |
| Mongo shell | `docker compose exec mongodb mongosh -u <user> -p <pass>` |
| Postgres shell | `docker compose exec postgres psql -U <user> -d <db>` |

**Cleanup**

| কাজ | কমান্ড |
|---|---|
| জায়গা দেখো | `docker system df` |
| পরিষ্কার | `docker system prune` / `docker image prune -a` / `docker volume prune` |

---

# পর্ব ৮ — পরের ধাপ

## ১৬. Kubernetes পরিচিতি ও প্রস্তুতি

### ১৬.১ Kubernetes কী (সহজ ভাষায়)

**Kubernetes (K8s)** হলো অনেকগুলো সার্ভারে container চালানো আর সামলানোর সিস্টেম।

> 💡 **তুলনা:**
> - **Docker** = একটা শিপিং কন্টেইনার। জিনিস (অ্যাপ) প্যাক করে রাখে।
> - **Docker Compose** = একটা ট্রাক। একটা মেশিনে কয়েকটা কন্টেইনার একসাথে নিয়ে চলে।
> - **Kubernetes** = পুরো বন্দরের ম্যানেজমেন্ট সিস্টেম। শত শত কন্টেইনার অনেক জাহাজে (সার্ভারে) ভাগ করে দেয়। কোনো জাহাজ ডুবলে তার কন্টেইনার অন্য জাহাজে তুলে দেয়, আর চাহিদা বাড়লে আরও কন্টেইনার পাঠায়।

তুমি K8s-কে বলো **"আমি কী চাই"** (যেমন "backend-এর ৩টা কপি সবসময় চালু থাকবে")। K8s নিজে থেকে সেটা বজায় রাখে। একটা কপি ক্র্যাশ করলে নিজেই নতুন একটা চালায়। এটাকে বলে **declarative** পদ্ধতি।

### ১৬.২ Compose থাকতে K8s কেন

| দরকার | Compose | Kubernetes |
|---|---|---|
| মেশিন | একটা | অনেকগুলো (cluster) |
| Container ক্র্যাশ করলে | `restart: always` পর্যন্ত | অটো নতুন চালায়, দরকার হলে অন্য মেশিনে |
| Traffic বাড়লে কপি বাড়ানো | হাতে | অটো scaling |
| নতুন ভার্সন deploy | বন্ধ করে চালু (downtime) | ধীরে ধীরে বদলায়, downtime ছাড়া (rolling update), সমস্যা হলে rollback |
| Load balancing | নেই | built-in |
| শেখা কঠিন? | সহজ | বেশ কঠিন |
| কখন | লোকাল ডেভ, ছোট অ্যাপ, একটা VPS | বড় production, অনেক service, অনেক সার্ভার |

> 💡 ছোট ক্লায়েন্ট প্রজেক্টে Compose + একটা VPS-ই যথেষ্ট। K8s দরকার হয় বড় স্কেলে, আর চাকরির বাজারে (DevOps / backend / AI infra রোলে) এটা জানা বড় প্লাস।

### ১৬.৩ মূল শব্দগুলো

| শব্দ | মানে | Docker-এ যার মতো |
|---|---|---|
| **Cluster** | K8s-এর অধীনে থাকা সব মেশিন মিলে একটা দল | — |
| **Node** | Cluster-এর একটা মেশিন (সার্ভার/VM) | আমার PC |
| **Pod** | K8s-এর সবচেয়ে ছোট একক। এক বা একাধিক container-এর মোড়ক | container |
| **Deployment** | "এই image-এর এতগুলো Pod সবসময় চালু রাখো" | Compose-এর একটা service |
| **Service** | Pod-গুলোর জন্য একটা স্থায়ী নাম/IP আর load balancer (Pod-এর IP বদলায়, Service-এরটা বদলায় না) | service নাম দিয়ে DNS |
| **Ingress** | বাইরের দুনিয়া (ডোমেইন) থেকে ভেতরের Service-এ traffic পাঠায় | `-p` / Nginx reverse proxy |
| **ConfigMap / Secret** | কনফিগ আর গোপন তথ্য (password) | `.env` / `env_file` |
| **PersistentVolume (PV/PVC)** | স্থায়ী স্টোরেজ | named volume |
| **Namespace** | একই cluster-এ আলাদা আলাদা ভাগ (dev/staging/prod) | আলাদা Compose প্রজেক্ট |
| **kubectl** | K8s-কে কমান্ড দেওয়ার CLI | `docker` CLI |

### ১৬.৪ ছোট্ট উদাহরণ: একটা backend Deployment + Service

```yaml
# backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3                       # ৩টা কপি সবসময় চালু থাকবে
  selector:
    matchLabels: { app: backend }
  template:
    metadata:
      labels: { app: backend }
    spec:
      containers:
        - name: backend
          image: <hub-user>/ts-docker-backend:v5   # Docker Hub-এ push করা image
          ports:
            - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: backend                     # অন্য Pod এই নামে কানেক্ট করবে (Docker DNS-এর মতো)
spec:
  selector: { app: backend }
  ports:
    - port: 5000
      targetPort: 5000
```
```bash
kubectl apply -f backend.yaml
kubectl get pods
```
```
deployment.apps/backend created
service/backend created
NAME                       READY   STATUS    RESTARTS   AGE
backend-7d9f8c6b5-2xkqp    1/1     Running   0          12s
backend-7d9f8c6b5-8mzrt    1/1     Running   0          12s
backend-7d9f8c6b5-qw4ln    1/1     Running   0          12s
```
একটা Pod মুছে দিলে (`kubectl delete pod backend-7d9f...`) K8s কয়েক সেকেন্ডের মধ্যে নতুন একটা বানিয়ে আবার ৩টা পূর্ণ করে দেবে।

> 💡 খেয়াল করো: K8s-এ **image আগে Docker দিয়েই build করে registry-তে push করতে হয়।** K8s নিজে image build করে না। এজন্যই Docker আগে ভালো করে শেখা জরুরি।

### ১৬.৫ প্রস্তুতি: Docker-এ যা যা ভালো করে জানতে হবে

এই নোটের এই অংশগুলো আত্মবিশ্বাসের সাথে পারলে K8s-এর জন্য তৈরি:

- [ ] **Image vs container**, আর container-এর জীবনচক্র: run, stop, rm (সেকশন ১, ৩)
- [ ] **Dockerfile লেখা:** layer cache, `CMD`/`ENTRYPOINT`, **multi-stage build** দিয়ে ছোট production image (সেকশন ৪, ১১)
- [ ] **Registry:** tag, push, pull (সেকশন ৪.৩)। K8s সবসময় registry থেকে image টানে
- [ ] **Env ও secret বাইরে রাখা,** image-এর ভেতরে না (সেকশন ৬)
- [ ] **Volume কেন লাগে,** stateless আর stateful অ্যাপের পার্থক্য (সেকশন ৫)
- [ ] **Networking:** port mapping, container-এর নিজের `localhost`, service নাম দিয়ে DNS (সেকশন ৭)
- [ ] **Docker Compose দিয়ে multi-service অ্যাপ চালানো** (সেকশন ৮)। K8s-এর ধারণাগুলো এর সরাসরি বড় সংস্করণ
- [ ] **Logs দেখে debug করা** (`logs`, `exec`)। K8s-এ এর সমান কমান্ড হলো `kubectl logs`, `kubectl exec`

### ১৬.৬ Docker ছাড়া আর যা লাগবে

| বিষয় | কতটুকু | কেন |
|---|---|---|
| **YAML** | ভালোভাবে (ইনডেন্ট, লিস্ট, ম্যাপ, `---`) | K8s-এর সব কনফিগ YAML-এ লেখা |
| **Linux কমান্ড লাইন** | বেসিক (`ls`, `cat`, `ps`, `curl`, ফাইল permission, env) | Pod-এর ভেতরে debug করতে |
| **Networking বেসিক** | IP, port, DNS, HTTP, load balancer, reverse proxy কী | Service আর Ingress বুঝতে |
| **একটা cloud-এর বেসিক** (ঐচ্ছিক, পরে) | AWS/GCP/Azure-এর VM, managed DB | রিয়েল cluster চলে EKS/GKE/AKS-এ |

### ১৬.৭ কোথায় প্র্যাকটিস করবো ও শেখার ক্রম

**লোকাল cluster (ফ্রি):**
- **Docker Desktop:** Settings → Kubernetes → Enable। এক ক্লিকে cluster, আর `kubectl` সাথেই আসে ✅ শুরু করার জন্য সবচেয়ে সহজ
- **minikube** বা **kind:** আলাদা টুল, একটু বেশি নিয়ন্ত্রণ দেয়

```bash
kubectl get nodes
```
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   2m    v1.31.1
```

**শেখার ক্রম:**
1. Pod → Deployment → Service (একটা অ্যাপ চালানো)
2. ConfigMap ও Secret (env)
3. PersistentVolume (MongoDB/Postgres চালানো)
4. Ingress (ডোমেইন দিয়ে বাইরে খোলা)
5. Scaling, rolling update, rollback
6. Helm (K8s-এর "package manager", পরের ধাপ)

> 💡 **প্র্যাকটিস প্রজেক্ট:** এই নোটের `ts-docker` অ্যাপটাই (Next.js + Node + MongoDB) Compose থেকে K8s-এ সরিয়ে নাও। প্রতিটা Compose service-কে একটা Deployment + Service বানাও, `.env`-কে ConfigMap/Secret, আর `ts-docker-db` volume-কে PVC।
