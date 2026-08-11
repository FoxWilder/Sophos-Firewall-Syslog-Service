# Sophos Firewall Syslog Service Launcher for Windows Server / Windows 11
# Requires PowerShell 5.1 or PowerShell Core 7+

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Sophos Firewall Syslog Receiver " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Check if Python is installed
$pythonPath = Get-Command python -ErrorAction SilentlyContinue

if (-not $pythonPath) {
    Write-Host "[!] Python is not detected in PATH. Please install Python 3.8+." -ForegroundColor Red
    Exit 1
}

# Ensure Firewall Rules
Write-Host "[*] Checking Windows Firewall Inbound Rules..." -ForegroundColor Yellow
$udpRule = Get-NetFirewallRule -DisplayName "Sophos Syslog UDP 5514" -ErrorAction SilentlyContinue
$tcpRule = Get-NetFirewallRule -DisplayName "Sophos Syslog TCP 5514" -ErrorAction SilentlyContinue

if (-not $udpRule) {
    Write-Host "[*] Adding Inbound Rule: UDP 5514..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "Sophos Syslog UDP 5514" -Direction Inbound -Protocol UDP -LocalPort 5514 -Action Allow | Out-Null
}

if (-not $tcpRule) {
    Write-Host "[*] Adding Inbound Rule: TCP 5514..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "Sophos Syslog TCP 5514" -Direction Inbound -Protocol TCP -LocalPort 5514 -Action Allow | Out-Null
}

Write-Host "[+] Firewall rules configured!" -ForegroundColor Green
Write-Host "[*] Launching Python Syslog Listener Daemon..." -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot
python syslog_receiver.py --ip 0.0.0.0 --udp-port 5514 --tcp-port 5514
