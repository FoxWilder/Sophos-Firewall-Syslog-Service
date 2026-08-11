import socket
import argparse
import time

SOPHOS_SAMPLE_MESSAGES = [
    '<134>1 2026-08-11T12:00:00Z SFOS-HQ-01 device_name="SFOS" device_id="XG12345678" log_component="Firewall" log_type="Traffic" log_subtype="Allowed" status="Allow" priority="Information" fw_rule_id="12" src_ip="192.168.1.105" dst_ip="1.1.1.1" src_port="54122" dst_port="443" protocol="TCP" app_name="HTTPS"',
    '<131>1 2026-08-11T12:01:15Z SFOS-BRANCH-02 device_name="SFOS" device_id="XG87654321" log_component="IPS" log_type="IDP" log_subtype="Anomaly" status="Deny" priority="Critical" src_ip="185.220.101.5" dst_ip="192.168.1.1" src_port="43211" dst_port="22" protocol="TCP" message="SSH Brute Force Threat Detected"',
    '<133>1 2026-08-11T12:02:30Z SFOS-HQ-01 device_name="SFOS" device_id="XG12345678" log_component="Authentication" log_type="Auth" log_subtype="User" status="Success" priority="Information" user_name="admin" src_ip="10.0.0.50" message="User admin logged in via WebAdmin"'
]

def send_test_syslog(host, port, protocol):
    print(f"[*] Sending test Sophos SFOS Syslog packets to {host}:{port} via {protocol.upper()}...")
    
    for i, msg in enumerate(SOPHOS_SAMPLE_MESSAGES, 1):
        if protocol.lower() == 'udp':
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.sendto(msg.encode('utf-8'), (host, port))
            sock.close()
        else:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((host, port))
            sock.sendall(msg.encode('utf-8'))
            sock.close()
        print(f" [+] Packet {i}/{len(SOPHOS_SAMPLE_MESSAGES)} transmitted.")
        time.sleep(0.5)

    print("[+] Transmission test complete!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Sophos Syslog Packet Test Generator")
    parser.add_argument('--host', default='127.0.0.1', help="Target Syslog Collector IP")
    parser.add_argument('--port', type=int, default=5514, help="Target Syslog Collector Port")
    parser.add_argument('--protocol', default='udp', choices=['udp', 'tcp'], help="Transport Protocol")
    args = parser.parse_args()

    send_test_syslog(args.host, args.port, args.protocol)
