# Sophos Firewall Syslog Service

A high-performance real-time Sophos SFOS Syslog Receiver, Log Parser, and Security Monitoring Console built with React, Vite, TypeScript, Tailwind CSS, Recharts, and Lucide Icons.

[![Build and Deploy Web Preview](https://github.com/FoxWilder/Sophos-Firewall-Syslog-Service/actions/workflows/deploy.yml/badge.svg)](https://github.com/FoxWilder/Sophos-Firewall-Syslog-Service/actions/workflows/deploy.yml)
[![Live Web Preview](https://img.shields.io/badge/Live_Preview-GitHub_Pages-00d1b2?style=flat&logo=github)](https://FoxWilder.github.io/Sophos-Firewall-Syslog-Service/)
[![Release](https://img.shields.io/badge/Release-v1.0.0-emerald)](https://github.com/FoxWilder/Sophos-Firewall-Syslog-Service/releases)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Key Features

- 🖥️ **Tactical Dark Console UI**: High-density SOC dashboard with monospace typography and low-eyestrain dark palette.
- ⚡ **Real-Time Log Stream**: Live ingestion stream with play/pause controls, instant buffer flush, and status indicators.
- 🔍 **Sophos Key-Value Parser**: Extracts key parameters (`device_name`, `src_ip`, `dst_ip`, `log_id`, `fw_rule_id`, `user_name`, `app_name`).
- 📊 **Recharts Visual Analytics**: Hourly log volume trends, severity distribution pie charts, top firewall host metrics, and facility ratios.
- ⚙️ **Listener Settings & Alert Engine**: Custom ports (UDP/TCP/TLS), log retention windows, file size rotation thresholds, and critical alert triggers.
- 🛠️ **Windows Server & Linux Daemon**: Complete Python socket server daemon with Windows PowerShell launcher and systemd service file.
- 🚀 **GitHub Pages Deployment**: Automated CI/CD pipeline via GitHub Actions for building and deploying the live Web Preview.

---

## 📂 Repository File Structure

```
Sophos-Firewall-Syslog-Service/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD for Pages Web Preview
├── src/
│   ├── components/
│   │   ├── AnalyticsView.tsx     # Recharts threat analytics dashboard
│   │   ├── DashboardView.tsx     # Primary live stream monitoring console
│   │   ├── EventDetailModal.tsx  # Syslog inspector with raw payload & KV grid
│   │   ├── EventExplorer.tsx     # Full-text search and multi-field log filter
│   │   ├── Header.tsx            # Navigation header & live status indicators
│   │   ├── SettingsView.tsx      # Receiver listener settings & alert rules
│   │   ├── SetupGuideView.tsx    # Windows Server & SFOS deployment guide
│   │   └── SyslogInjectorModal.tsx# Test packet generator modal
│   ├── data/
│   │   └── mockEvents.ts         # Sample SFOS log stream generator
│   ├── App.tsx                   # Main state container & view router
│   ├── main.tsx                  # Application mount point
│   ├── index.css                 # Tailwind CSS styling configuration
│   └── types.ts                  # TypeScript interfaces & log definitions
├── syslog-server/
│   ├── syslog_receiver.py        # Python dual UDP/TCP syslog socket server
│   ├── start-syslog-server.ps1   # PowerShell launcher & Windows firewall script
│   ├── send-test-syslog.py       # CLI syslog packet generator
│   ├── syslog_receiver.service   # Linux systemd service unit file
│   └── README.md                 # Backend Python service documentation
├── CHANGELOG.md                  # Version release history
├── RELEASE.md                    # Release v1.0.0 detailed documentation
├── README.md                     # Repository overview & setup instructions
├── server.ts                     # Express full-stack server with UDP/TCP 5514 sockets & SSE live stream
├── index.html                    # Single Page Application entry point
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build & relative path configuration
└── metadata.json                 # Application metadata
```

---

## 🚀 Quick Start & Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Python**: v3.8+ (for host syslog receiver service)

### 1. Web Preview Dashboard Setup

```bash
# Clone repository
git clone https://github.com/FoxWilder/Sophos-Firewall-Syslog-Service.git
cd Sophos-Firewall-Syslog-Service

# Install dependencies
npm install

# Start development server
npm run dev

# Run linter & TypeScript verification
npm run lint

# Build for production
npm run build
```

The web dashboard will be available at `http://localhost:3000`.

---

## 🛡️ Backend Syslog Receiver Setup

To run the host collector daemon on Windows Server or Linux:

### Windows Server / Windows 11 (PowerShell Admin)

```powershell
# Navigate to syslog-server directory
cd syslog-server

# Run setup and start listener on port 5514
.\start-syslog-server.ps1
```

### Linux (Systemd Service)

```bash
sudo cp syslog-server/syslog_receiver.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now syslog_receiver.service
```

### Test Packet Transmission

```bash
python syslog-server/send-test-syslog.py --host 127.0.0.1 --port 5514 --protocol udp
```

---

## 🌐 Live Web Preview

The Web Preview is automatically built and deployed via GitHub Pages workflow on every push to `main` or `v*` tag releases:

👉 **[Launch Live Web Preview](https://FoxWilder.github.io/Sophos-Firewall-Syslog-Service/)**

---

## 📄 License

Distributed under the [MIT License](LICENSE).
