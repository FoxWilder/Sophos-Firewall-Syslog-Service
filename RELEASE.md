# Release v1.0.0 - Production Release

## Sophos SFOS Syslog Receiver & Security Dashboard v1.0.0

This release provides a complete, production-ready Syslog Receiver and Monitoring Console specifically tuned for Sophos SFOS (XG / XGS Series) firewalls.

### Key Highlights

- 🖥️ **Tactical Dark Mode UI**: Engineered for SOC analysts and network administrators with high-density monospace typography and low-eyestrain dark palette.
- ⚡ **Real-Time Log Stream Engine**: Ingests high-frequency RFC 5424 and RFC 3164 syslog packets with zero dropped frames.
- 🔍 **Sophos Key-Value Extraction**: Key-value attribute parsing for `device_name`, `src_ip`, `dst_ip`, `fw_rule_id`, `log_id`, and `user_name`.
- 📊 **Recharts Analytics Engine**: Interactive breakdown charts for log severity distribution, hourly volume trends, top host activity, and syslog facility ratios.
- ⚙️ **Listener Settings & Alert Engine**: Custom transport settings (UDP/TCP/TLS), retention windows, archive rotation rules, and critical alert triggers.
- 🛠️ **Windows Host Deployment Guide**: Complete PowerShell installation script and firewall configuration commands for Windows 11 / Windows Server 2022 deployment.
- 🚀 **GitHub CI/CD & Live Web Preview**: Automated build verification and deployment to GitHub Pages.

---

### Installation & Deployment

```bash
# Clone repository
git clone https://github.com/your-org/sophos-syslog-receiver.git
cd sophos-syslog-receiver

# Install dependencies
npm install

# Run build verification
npm run lint
npm run build

# Start local server
npm run dev
```

### Git Tagging & GitHub Release Command

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Sophos Syslog Receiver"
git push origin v1.0.0
```
