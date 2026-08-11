# Sophos Firewall Syslog Backend Service

A lightweight Python syslog listener and packet parser for Sophos SFOS (XG / XGS Series) firewalls.

## Files Included

- `syslog_receiver.py`: Main Python dual UDP/TCP socket listener (port 5514).
- `start-syslog-server.ps1`: Windows PowerShell launch & firewall setup script.
- `send-test-syslog.py`: Test CLI packet generator.
- `syslog_receiver.service`: Systemd service unit file for Linux hosts.

## Quick Start

### Windows Server / Windows 11
```powershell
.\start-syslog-server.ps1
```

### Linux (Ubuntu / RHEL)
```bash
sudo cp syslog_receiver.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now syslog_receiver.service
```

### Test Transmission
```bash
python send-test-syslog.py --host 127.0.0.1 --port 5514 --protocol udp
```
