# CIMCO Inventory System v2 - DevOps & Deployment Guide

Complete DevOps configuration for deploying the CIMCO Inventory System v2 using Docker Compose, GitHub Actions, Nginx, and Let's Encrypt on DigitalOcean.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Deployment Process](#deployment-process)
- [Backup and Restore](#backup-and-restore)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Server Requirements (DigitalOcean Droplet)

- **OS**: Ubuntu 22.04 LTS or newer
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 2 vCPUs minimum
- **Storage**: 25GB SSD minimum
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Software Requirements

- Docker 24.0+
- Docker Compose 2.20+
- Git
- curl

### DNS Configuration

Ensure your domain points to the server IP:
```
cimco.osi-cyber.com → YOUR_SERVER_IP
```

## 🚀 Initial Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/cimco-v2
sudo chown $USER:$USER /opt/cimco-v2
cd /opt/cimco-v2

# Clone repository
git clone https://github.com/your-org/cimco-v2.git .
```

### 3. Environment Configuration

```bash
cd /opt/cimco-v2/ops

# Copy environment template
cp .env.example .env

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 48)
DB_PASSWORD=$(openssl rand -base64 32)

# Edit .env file with your values
nano .env
```

**Required `.env` variables:**
```bash
DB_USER=cimco
DB_PASSWORD=your_secure_db_password
DB_NAME=cimco_v2
JWT_SECRET=your_secure_jwt_secret
DOMAIN=cimco.osi-cyber.com
EMAIL=admin@osi-cyber.com
```

### 4. Initial SSL Certificate

```bash
# Create certbot directories
mkdir -p certbot_data certbot_www

# Obtain initial certificate (run once)
docker run -it --rm \
  -v $(pwd)/certbot_data:/etc/letsencrypt \
  -v $(pwd)/certbot_www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --agree-tos \
  --email admin@osi-cyber.com \
  -d cimco.osi-cyber.com
```

## 🔄 Deployment Process

### Manual Deployment

```bash
cd /opt/cimco-v2/ops

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy.sh
```

### Automated Deployment (GitHub Actions)

1. Add GitHub Secrets in your repository:
   - `HOST`: Server IP address
   - `USERNAME`: SSH username (e.g., `root` or `cimco`)
   - `SSH_KEY`: Private SSH key contents

2. Push to `main` branch triggers automatic deployment

3. Monitor deployment in GitHub Actions tab

### Verify Deployment

```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Run health check
./scripts/health-check.sh

# Test API
curl https://cimco.osi-cyber.com/api/health
```

## 💾 Backup and Restore

### Automated Backups

Add to crontab for daily backups at 2 AM:

```bash
# Edit crontab
crontab -e

# Add line
0 2 * * * cd /opt/cimco-v2/ops && ./scripts/backup.sh >> /var/log/cimco-backup.log 2>&1
```

### Manual Backup

```bash
cd /opt/cimco-v2/ops
./scripts/backup.sh
```

Backups are stored in `./backups/` directory with automatic rotation (keeps last 7).

### Restore from Backup

```bash
cd /opt/cimco-v2/ops

# List available backups
ls -la backups/

# Restore specific backup
./scripts/restore.sh backups/cimco_v2_backup_20240311_120000.sql.gz
```

**⚠️ Warning:** Restore replaces the current database. Ensure you have a current backup before restoring.

## 📊 Monitoring

### Health Checks

```bash
# Check all services
./scripts/health-check.sh

# Check individual components
curl https://cimco.osi-cyber.com/health          # Nginx
curl https://cimco.osi-cyber.com/api/health      # Backend
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Prometheus & Grafana (Optional)

To enable monitoring stack:

```bash
# Add to docker-compose.prod.yml services:

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"
    networks:
      - cimco-network

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
    ports:
      - "3000:3000"
    networks:
      - cimco-network
```

Access:
- Prometheus: http://your-server:9090
- Grafana: http://your-server:3000 (admin / ${GRAFANA_ADMIN_PASSWORD})

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs <service>

# Rebuild specific service
docker-compose -f docker-compose.prod.yml build --no-cache <service>
docker-compose -f docker-compose.prod.yml up -d <service>
```

#### Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U cimco

# Reset database (WARNING: Destroys data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d postgres
```

#### SSL Certificate Issues

```bash
# Renew certificates manually
docker run -it --rm \
  -v $(pwd)/certbot_data:/etc/letsencrypt \
  -v $(pwd)/certbot_www:/var/www/certbot \
  certbot/certbot renew

# Force renew
docker run -it --rm \
  -v $(pwd)/certbot_data:/etc/letsencrypt \
  -v $(pwd)/certbot_www:/var/www/certbot \
  certbot/certbot renew --force-renew
```

#### High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Getting Help

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Run health check: `./scripts/health-check.sh`
3. Verify environment: `cat .env | grep -v PASSWORD`
4. Check disk space: `df -h`

## 🔒 Security Best Practices

1. **Keep secrets secure**: Never commit `.env` file to git
2. **Regular updates**: Update base images monthly
3. **Firewall**: Enable UFW and allow only necessary ports
4. **SSH keys**: Disable password authentication, use key-based auth
5. **Backups**: Verify backup restoration process quarterly

## 📝 Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Update images | Monthly | `docker-compose -f docker-compose.prod.yml pull` |
| Clean old images | Weekly | `docker image prune -f` |
| Review logs | Daily | `docker-compose -f docker-compose.prod.yml logs --tail 100` |
| Check disk space | Weekly | `df -h` |
| Test backup restore | Quarterly | `./scripts/restore.sh <backup_file>` |

---

For additional support, contact the DevOps team at devops@osi-cyber.com
