# Changelog

All notable changes to the Sophos Syslog Receiver project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-11

### Added
- **Dark Tactical SIEM Design**: Complete high-contrast dark UI palette with emerald/teal accents inspired by cybersecurity SOC terminals.
- **Real-Time Live Event Monitoring**: Auto-scrolling live syslog event stream with freeze/unfreeze toggles, clear log function, and real-time status badges.
- **Sophos SFOS Parser**: Support for RFC 5424 / RFC 3164 syslog formats and automatic extraction of key-value parameters (`src_ip`, `dst_ip`, `fw_rule_id`, `log_component`, `user_name`).
- **Interactive Filtering & Search**: Multi-field full-text search, host selection, facility toggles (`firewall`, `auth`, `system`, `vpn`, `atp`, `ips`, `waf`), and severity filters (`Debug`, `Info`, `Notice`, `Warning`, `Error`, `Critical`).
- **Visual Analytics Dashboard**: Recharts time-series hourly trends, severity distribution pie charts, firewall host log volume bar charts, and facility volume metrics.
- **Receiver Configuration**: Configurable UDP (5514), TCP (5514), TLS ports, retention rules (days), storage directory settings, and automatic file compression.
- **Threat Alert Triggers**: Customizable alert trigger rules with audio notification signals on critical syslog events.
- **Syslog Packet Injector**: Interactive modal to craft and transmit simulated Sophos SFOS test syslog packets into the live receiver stream.
- **Windows Setup Guide**: Complete PowerShell installation script, Windows Defender Firewall rule configuration commands, and Sophos SFOS log settings step-by-step instructions.
- **GitHub Integration**: Integrated GitHub Actions workflow for automated TypeScript linting, production build verification, and GitHub Pages live web preview deployment.
