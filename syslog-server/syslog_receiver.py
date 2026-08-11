import socket
import select
import sys
import os
import json
import re
import argparse
from datetime import datetime

import urllib.request
import urllib.error

# Default configuration
HOST = '0.0.0.0'
UDP_PORT = 5514
TCP_PORT = 5514
LOG_DIR = './logs'
WEB_INGEST_URL = 'http://127.0.0.1:3000/api/syslog/ingest'

os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, 'sophos_syslog.log')

def parse_sophos_kv(raw_msg):
    """
    Parses Sophos SFOS key="value" or key=value syslog attributes into a dictionary.
    """
    attributes = {}
    pattern = re.compile(r'([a-zA-Z0-9_]+)=(?:"([^"]*)"|(\S+))')
    for match in pattern.finditer(raw_msg):
        key = match.group(1)
        val = match.group(2) if match.group(2) is not None else match.group(3)
        attributes[key] = val
    return attributes

def forward_to_web_dashboard(log_entry, web_url):
    if not web_url:
        return
    try:
        data = json.dumps(log_entry).encode('utf-8')
        req = urllib.request.Request(
            web_url, 
            data=data, 
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            pass
    except Exception:
        pass # Non-blocking if web interface is not active

def process_syslog_payload(data, addr, protocol, web_url=WEB_INGEST_URL):
    try:
        message = data.decode('utf-8', errors='replace').strip()
    except Exception as e:
        message = str(data)

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    kv_attrs = parse_sophos_kv(message)
    
    log_entry = {
        'time': timestamp,
        'protocol': protocol,
        'source_ip': addr[0],
        'source_port': addr[1],
        'raw_payload': message,
        'attributes': kv_attrs
    }

    log_line = json.dumps(log_entry) + '\n'
    print(f"[{timestamp}] [{protocol.upper()}] From {addr[0]}:{addr[1]} | Device: {kv_attrs.get('device_name', 'Unknown')} | LogID: {kv_attrs.get('log_id', 'N/A')}")
    
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(log_line)

    forward_to_web_dashboard(log_entry, web_url)

def run_server(bind_ip, udp_port, tcp_port):
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    udp_sock.bind((bind_ip, udp_port))

    tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tcp_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    tcp_sock.bind((bind_ip, tcp_port))
    tcp_sock.listen(10)

    print(f"==================================================")
    print(f" Sophos Firewall Syslog Receiver Service ")
    print(f" Listening UDP: {bind_ip}:{udp_port}")
    print(f" Listening TCP: {bind_ip}:{tcp_port}")
    print(f" Log File: {os.path.abspath(LOG_FILE)}")
    print(f"==================================================")

    inputs = [udp_sock, tcp_sock]

    try:
        while True:
            readable, _, _ = select.select(inputs, [], [])
            for s in readable:
                if s is udp_sock:
                    data, addr = udp_sock.recvfrom(8192)
                    process_syslog_payload(data, addr, 'udp')
                elif s is tcp_sock:
                    conn, addr = tcp_sock.accept()
                    data = conn.recv(8192)
                    if data:
                        process_syslog_payload(data, addr, 'tcp')
                    conn.close()
    except KeyboardInterrupt:
        print("\n[!] Shutting down Sophos Syslog Receiver...")
    finally:
        udp_sock.close()
        tcp_sock.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Sophos Firewall Syslog Receiver")
    parser.add_argument('--ip', default=HOST, help="Bind IP address (default: 0.0.0.0)")
    parser.add_argument('--udp-port', type=int, default=UDP_PORT, help="UDP Syslog Port (default: 5514)")
    parser.add_argument('--tcp-port', type=int, default=TCP_PORT, help="TCP Syslog Port (default: 5514)")
    args = parser.parse_args()

    run_server(args.ip, args.udp_port, args.tcp_port)
