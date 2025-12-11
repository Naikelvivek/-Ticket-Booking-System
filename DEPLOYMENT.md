# Deployment Guide

Complete guide for deploying the Ticket Booking System to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- GitHub account (for code hosting)
- Backend hosting service (Render, Heroku, AWS, DigitalOcean)
- Frontend hosting service (Vercel, Netlify)
- PostgreSQL database (AWS RDS, Supabase, Railway)
- Domain name (optional)

### Local Setup
- Node.js v16+
- Docker (for containerization)
- PostgreSQL client tools
- AWS CLI or equivalent (if using cloud services)

## Backend Deployment

### Option 1: Deploy to Render

1. **Prepare for Deployment**
```bash
# In backend directory
npm run build
git push origin main
```

2. **Create Render Account**
- Visit https://render.com
- Sign up with GitHub
- Authorize access to repositories

3. **Create PostgreSQL Database**
- In Render dashboard: New > PostgreSQL
- Choose plan (free tier available)
- Note the connection string

4. **Create Web Service**
- New > Web Service
- Connect GitHub repository
- Select branch (main)
- Environment: Node
- Build command: `npm install && npm run build`
- Start command: `node dist/index.js`

5. **Set Environment Variables**
In Render dashboard, add:
```
DATABASE_URL=<postgres_connection_string>
PORT=5000
NODE_ENV=production
```

6. **Deploy**
- Render automatically deploys on git push
- Monitor logs in dashboard
- Get public URL (e.g., https://ticket-booking-backend.onrender.com)

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create App**
```bash
cd backend
heroku create ticket-booking-backend
```

4. **Add PostgreSQL Add-on**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
```

6. **Deploy**
```bash
git push heroku main
```

7. **View Logs**
```bash
heroku logs --tail
```

### Option 3: Deploy to AWS EC2

1. **Launch EC2 Instance**
- Choose Ubuntu 20.04 LTS
- Select t3.micro (free tier)
- Configure security groups (ports 22, 80, 443, 5000)

2. **SSH into Instance**
```bash
ssh -i key.pem ubuntu@<ec2-ip>
```

3. **Install Dependencies**
```bash
sudo apt update
sudo apt install -y curl nodejs npm postgresql

# Install Node version manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
```

4. **Clone Repository**
```bash
git clone <repository-url>
cd -Ticket-Booking-System/backend
npm install
npm run build
```

5. **Create Environment File**
```bash
echo "DATABASE_URL=postgresql://user:password@db-host:5432/ticket_booking_db" > .env
echo "PORT=5000" >> .env
echo "NODE_ENV=production" >> .env
```

6. **Install PM2 Process Manager**
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name ticket-booking-api
pm2 startup
pm2 save
```

7. **Setup Nginx Reverse Proxy**
```bash
sudo apt install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/ticket-booking << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/ticket-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Frontend Deployment

### Option 1: Deploy to Vercel

1. **Connect GitHub Repository**
- Visit https://vercel.com
- Click "New Project"
- Select repository
- Authorize access

2. **Configure Build Settings**
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

3. **Set Environment Variables**
```
REACT_APP_API_BASE_URL=https://ticket-booking-backend.onrender.com/api
```

4. **Deploy**
- Vercel automatically deploys on git push
- Get URL: https://ticket-booking-frontend.vercel.app

### Option 2: Deploy to Netlify

1. **Connect GitHub Repository**
- Visit https://netlify.com
- Click "New site from Git"
- Select repository
- Authorize access

2. **Configure Build Settings**
- Build command: `npm run build`
- Publish directory: `build`

3. **Set Environment Variables**
In Netlify dashboard:
```
REACT_APP_API_BASE_URL=https://your-backend-url/api
```

4. **Deploy**
```bash
# Or deploy manually
npm run build
netlify deploy --prod --dir=build
```

### Option 3: Manual Deployment

1. **Build Application**
```bash
cd frontend
npm run build
```

2. **Deploy Static Files**
```bash
# Upload 'build' directory to web server
# Using FTP, S3, or similar service

# Example with AWS S3
aws s3 sync build/ s3://your-bucket-name/
```

3. **Setup CloudFront (CDN)**
- Create distribution
- Point to S3 bucket
- Set CNAME to domain

## Database Setup

### Option 1: AWS RDS

1. **Create RDS Instance**
```bash
aws rds create-db-instance \
    --db-instance-identifier ticket-booking-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password <password> \
    --allocated-storage 20
```

2. **Wait for Instance Creation**
```bash
aws rds describe-db-instances --db-instance-identifier ticket-booking-db
```

3. **Get Endpoint**
```bash
aws rds describe-db-instances --db-instance-identifier ticket-booking-db \
    --query 'DBInstances[0].Endpoint.Address' --output text
```

4. **Update Connection String**
```
DATABASE_URL=postgresql://postgres:password@ticket-booking-db.c9akciq32.us-east-1.rds.amazonaws.com:5432/ticket_booking_db
```

### Option 2: Supabase

1. **Create Supabase Project**
- Visit https://supabase.com
- Create new project
- Wait for initialization

2. **Get Connection String**
- Project Settings > Database > URI
- Copy PostgreSQL connection string

3. **Update Environment**
```
DATABASE_URL=postgresql://postgres:<password>@db.<region>.supabase.co:5432/postgres
```

### Option 3: Railway

1. **Create Railway Account**
- Visit https://railway.app
- Sign up with GitHub

2. **Create PostgreSQL Service**
- New Project
- Add PostgreSQL

3. **Get Database URL**
- Project settings
- Copy DATABASE_URL

## Environment Configuration

### Production Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@db-host:5432/ticket_booking_db
PORT=5000
NODE_ENV=production
```

#### Frontend (.env)
```
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

### Docker Environment

Create docker-compose.yml:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ticket_booking_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ticket_booking_db
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_BASE_URL: http://backend:5000/api

volumes:
  postgres_data:
```

### Run Docker Compose

```bash
docker-compose up -d
```

## Monitoring & Maintenance

### Backend Monitoring

**Set Up Logging**
```bash
# PM2 with logging
pm2 logs ticket-booking-api

# View logs in dashboard
pm2 monit
```

**Monitor Performance**
```bash
# Check memory usage
pm2 show ticket-booking-api

# Monitor CPU/Memory
watch 'pm2 show ticket-booking-api | grep -E "memory|cpu"'
```

### Database Maintenance

**Regular Backups**
```bash
# Daily backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/backup-$(date +\%Y\%m\%d).sql
```

**Vacuum Database**
```bash
psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

### Monitoring Tools

1. **Application Performance Monitoring (APM)**
   - New Relic
   - DataDog
   - Sentry for error tracking

2. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

3. **Log Aggregation**
   - ELK Stack
   - CloudWatch
   - Datadog

## Scaling Production Setup

### Load Balancing

```nginx
upstream backend_servers {
    server server1.com:5000;
    server server2.com:5000;
    server server3.com:5000;
}

server {
    listen 80;
    server_name api.ticket-booking.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Replication

```bash
# Primary database
# Set in postgresql.conf:
# wal_level = replica
# max_wal_senders = 3

# Connect standby to primary
# In recovery.conf:
# primary_conninfo = 'host=primary_host user=postgres password=password'
```

### Caching Layer (Redis)

```bash
# Install Redis
sudo apt install -y redis-server

# Add to backend application
# (implementation depends on caching strategy)
```

## Troubleshooting

### Backend Not Connecting to Database

```bash
# Check connection string
psql $DATABASE_URL

# Verify security groups allow access
# Check database user permissions
psql -U postgres -c "\du"

# Test connection
telnet db-host 5432
```

### Frontend Not Loading

```bash
# Check API URL configuration
echo $REACT_APP_API_BASE_URL

# Check CORS settings in backend
# Verify backend is accessible

# Test with curl
curl https://your-api-domain.com/api/health
```

### Application Crashes

```bash
# Check logs
pm2 logs ticket-booking-api

# Restart service
pm2 restart ticket-booking-api

# Check disk space
df -h

# Check memory
free -h
```

### Database Disk Space Full

```bash
# Check size
du -sh /var/lib/postgresql

# Archive old bookings
DELETE FROM bookings WHERE updated_at < NOW() - INTERVAL '90 days';

# Vacuum
VACUUM FULL;
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Database created and initialized
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] APIs responding correctly
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Documentation updated

## Rollback Procedure

```bash
# Render
# Just redeploy from previous commit

# Heroku
heroku releases
heroku rollback v<version-number>

# Manual/EC2
git checkout previous-version
npm run build
pm2 restart ticket-booking-api
```

---

For questions or issues, refer to service-specific documentation or create an issue on GitHub.
