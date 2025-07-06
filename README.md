# 🌐 Track-Sphere: A Dockerized Kafka Pipeline for Real-Time Web Activity Tracking

A full-stack, real-time Web Activity Tracking Platform that captures and visualizes user browsing behavior using a custom-built Chrome extension. 
The project leverages a robust microservices architecture featuring Kafka for high-throughput event streaming, PostgreSQL for reliable data persistence, 
Grafana for insightful analytics and Docker for scalable containerization — all deployed on an AWS EC2 instance with HTTPS support via NGINX reverse proxy.

<br>

## 📌 Features

-📦 Real-time data pipeline: Events (e.g., page visits) are tracked instantly and processed through a Kafka stream into a PostgreSQL database.

-🌐 Browser extension: Custom Chrome extension captures session-level data like URL, timestamp, browser, platform, and user-agent.

-📊 Live dashboard: Grafana visualizes traffic trends, browser/platform usage, and session timelines in an admin-accessible dashboard.

-☁️ Production-ready: End-to-end deployment on AWS EC2 using Docker Compose with SSL encryption, reverse proxy (NGINX), and persistent volumes.

-🛠️ Modular & Maintainable: Clear separation between the Kafka producer (Node.js backend), consumer, and frontend collection logic.

<br>

## 📐 Architecture

                        ┌─────────────────────────────┐
                               🌐 User's Browser       
                        │   ────────────────────────  │
                        │  Chrome Extension (JS)      │
                        │  - Captures URL + Meta data │
                        │  - Sends HTTP POST →        │
                        └────────────┬────────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                           🚀 Backend API (Express)  
                        │  - Validates incoming data │
                        │  - Extracts IP/User-Agent  │
                        │  - KafkaJS Producer sends  │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                              🟠 Kafka Topic            
                        │  - Topic: `web-activity`   │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────────┐
                           🧠 Kafka Consumer (Node.js) 
                        │  - Subscribes to topic       │
                        │  - Inserts into PostgreSQL   │
                        └────────────┬─────────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                           🗃️ PostgreSQL Database      
                        │  - Table: `activity_logs`  │
                        │  - Stores session, event,  │
                        │    browser, IP, etc.       │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                           📊 Grafana (on Port 3001)  
                        │  - Queries PostgreSQL      │
                        │  - Visualizes analytics    │
                        └────────────────────────────┘

                      🐳 All services run in Docker
                      🔒 HTTPS via NGINX Reverse Proxy (443)

<br>

## ⚙️ Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| Event Source | Chrome Extension   |
| Messaging    | Kafka + Zookeeper  |
| Backend API  | Node.js (Express)  |
| DB           | PostgreSQL         |
| Analytics    | Grafana            |
| Security     | HTTPS via NGINX    |
| Infra        | Docker Compose     |
| Cloud        | AWS EC2            |

<br>

## 🚀 Getting Started (Development)

### ✅ Prerequisites

- Docker & Docker Compose
- Git
- Node.js (for local backend testing)
- AWS Account

### 📁 Project Structure

```bash
WEB-ACTIVITY-TRACKER/
├── backend/
│   ├── .env
│   ├── Dockerfile
│   ├── kafkaProducer.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── consumer/
│   ├── .env
│   ├── Dockerfile
│   ├── init.sql
│   ├── db.js
│   ├── consumer.js
│   ├── package.json
│   └── package-lock.json
│
├── extension/
│   ├── background.js
│   └── manifest.json
│
├── nginx/
│   ├── Dockerfile
│   ├── fullchain.pem
│   ├── privkey.pem
│   └── nginx.conf
│
├── secrets/                    # Keep your SSH Keys , AWS Keys here
├── .env                        # Root env file for Docker Compose
├── .gitignore
├── docker-compose.yml
└── README.md
```

<br>

# 🚀 Project Setup

<br>

## ✅ 1. Set Up EC2 and Clone Repository

### 🛡️ Create EC2 Instance

1. Go to **AWS EC2 Dashboard** → **Launch Instance**.
2. Choose **Ubuntu 22.04 LTS** (or **Amazon Linux 2**).
3. Select **t2.micro** (Free Tier eligible).
4. Configure storage:
   - Default is **8 GB**.
   - Max for Free Tier is **30 GB**.
5. Under **Security Group** settings:
   - Allow **SSH (port 22)** – only for your IP (or open for web access).
   - Allow **HTTP (port 80)** and **HTTPS (port 443)** – for web access.
   - Allow custom TCP ports:
     - `3000` → backend server  
     - `3001` → Nginx  
     - `9092` → Kafka  
     - `5432` → PostgreSQL (optional if accessing externally)  
     - `9000` or `3002` → Grafana (optional)

### 📌 Associate Elastic IP (Optional but Recommended)

1. Go to **Elastic IPs** in the AWS EC2 sidebar.
2. Allocate a new IP and associate it with your EC2 instance.
3. This ensures your instance has a **static IP**, even after restarts.


### 📥 Set File Permissions for Key

After downloading your `.pem` key file:

```bash
chmod 400 your-key.pem
```

### 🚀 Connect to EC2

```bash
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

### 🐳 Install Docker & Docker Compose v2

```bash
sudo apt update
sudo apt install -y docker.io git

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Allow your user to run docker commands without sudo
sudo usermod -aG docker ubuntu
newgrp docker
```

### ✅ Install Docker Compose v2 (as CLI plugin)

```bash
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.24.2/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
```

### 🔍 Verify Installation

To check Docker Compose version:

```bash
docker compose version
```

**Expected output:**
```bash
Docker Compose version v2.24.2
```

### 📦 Clone the Repository

```bash
git clone https://github.com/tyagi0320/Web-Activity-Tracker-v2.git
cd Web-Activity-Tracker-v2
```

<br>

## ✅ 2. Configure `.env` Files

1) Create a `.env` file in the root:

```env
# PostgreSQL
PG_USER=webuser
PG_PASSWORD=webpass
PG_DB=webtracker
PG_HOST=postgres
PG_PORT=5432

# Kafka
KAFKA_BROKER=kafka:9092

# Grafana Admin
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

```

2) Create a `.env` file in backend
```env
KAFKA_BROKER=kafka:9092
PORT=3000
```
<br>

### ✅ 3. Add SSL certificates

🌐 Step 1: Create a DNS A Record
Log in to your domain provider (e.g., Namecheap, GoDaddy) and create a DNS record:

- Type: A
- Host: monitor
- Points to: Your EC2 Elastic IP (e.g., 13.234.123.45)
- TTL: Automatic / Default

This maps monitor.global-dev.tech to your EC2 instance.


🔐 Step 2: Install Certbot and Generate SSL Certificates
From your EC2 terminal:
 ```bash
 sudo apt install certbot
```

Then issue certificates (replace with your actual subdomain):

```bash
sudo certbot certonly --standalone -d monitor.global-dev.tech
```
📁 Step 3: Copy Certificates to nginx/ Folder
Navigate to the Web-Activity-Tracker/nginx directory and run:   
```bash
sudo cp /etc/letsencrypt/live/monitor.global-dev.tech/fullchain.pem .
sudo cp /etc/letsencrypt/live/monitor.global-dev.tech/privkey.pem
```
💡 Ensure nginx.conf uses /etc/ssl/fullchain.pem and /etc/ssl/privkey.pem paths inside the container.
These are mapped from the copied cert files during image build.

<br>

### ✅ 4. Start All Containers

```bash
docker compose up --build -d
```

<br>

### ✅ 5. Install the Chrome Extension

- Go to `chrome://extensions` 
- Enable **Developer Mode**
- Click **Load Unpacked**
- Select the `/extension` folder

NOTE: Similarly you can have your extension installed on other web browsers as well.

<br>

### ✅ 6. View Data in PostgreSQL

```bash
docker exec -it webactivitytracker-postgres-1 psql -U webuser -d webtracker
```

Run query:

```sql
SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10;
```

<br>

### ✅ 7. 📊 Grafana Setup for Web Activity Tracker

**Step-1: Visit in your browser**

```
https://monitor.global-dev.tech/grafana
```

**Step-2: Login using Default credentials**

- Username: `admin`
- Password: `admin` (you'll be prompted to change it, change if required)

**Step-3: Add PostgreSQL as a Data Source**

1. Go to **Data Sources**
2. Click **"Add data source"**
3. Choose **PostgreSQL**
4. Fill in these details:

| Field     | Value            |
|-----------|------------------|
| Host      | `postgres:5432`  |
| Database  | `webtracker`     |
| User      | `webuser`        |
| Password  | `webpass`        |
| SSL Mode  | `disable`        |

5. Click **Save & Test**

*You should see: **Data source is working**

<br>

### ✅ 8. 📈 Create Dashboards

### 1. **Most Visited URLs**

```sql
SELECT
  url AS "URL",
  count(*) AS "Visits"
FROM activity_logs
GROUP BY url
ORDER BY "Visits" DESC
LIMIT 10;
```

- Visualization: `Bar gauge` 

---

### 2. **Event Count Over Time**

```sql
SELECT
  date_trunc('minute', timestamp) AS "Time",
  count(*) AS "Events"
FROM activity_logs
GROUP BY 1
ORDER BY 1;
```

- Visualization: `Time series`

---

### 3. **Platform Breakdown**

```sql
SELECT
  platform,
  count(*) AS "Count"
FROM activity_logs
GROUP BY platform;
```

- Visualization: `Bar chart`

---

### 4. **Browser Usage**

```sql
SELECT
  browser,
  count(*) AS "Count"
FROM activity_logs
GROUP BY browser;
```
- Visualization: `Pie chart`

<br>

# 🎉 HURRAY! Dashboards Are Live! 🚀

You've made it! Your real-time web activity tracking system is fully operational :)

⚡️ **Powered By:**
- 🐘 PostgreSQL — Persistently storing your activity logs.
- 🧵 Kafka — Streaming your web events with high throughput and durability.
- 🌐 Chrome Extensions — Capturing browsing sessions directly from the user’s browser.
- 📊 Grafana — Real-time visualizations that keep you in the loop.
- 🐳 Docker — Orchestrating everything in isolated, production-ready containers.
- 🔐 SSL (HTTPS) — Securing all traffic via NGINX reverse proxy with Let's Encrypt certificates.

<br>

📡 **What’s Happening Right Now:**
- Your Chrome extension is silently capturing page visits.
- Events are sent to the Kafka broker and processed by a Kafka consumer.
- Logs are inserted into PostgreSQL, ensuring durability and structure.
- Grafana dashboards reflect your browsing activity in real time.
- Thanks to NGINX + SSL, your API and dashboards are served securely over HTTPS.
- Docker Compose keeps all services up, portable, and easily deployable.

<br>

🧠 **Learning from this project:**

✅  Dockerized microservices architecture

✅  Kafka event streaming system

✅  PostgreSQL-backed event logging

✅  Grafana monitoring stack

✅  SSL-secured NGINX reverse proxy

✅  Chrome extension integration

✅ DNS + custom domain setup

<br>

## Author

📧 Email: tharshit03@gmail.com  
🔗 GitHub: [@tyagi0320](https://github.com/tyagi0320)

## License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
