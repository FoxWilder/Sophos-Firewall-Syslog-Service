import React, { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Play, 
  Server, 
  CheckCircle2 
} from "lucide-react";

export const SetupGuideView: React.FC = () => {
  const [copiedRule1, setCopiedRule1] = useState(false);
  const [copiedRule2, setCopiedRule2] = useState(false);
  const [copiedStart, setCopiedStart] = useState(false);

  const startCmd = `cd syslog-server\n.\\start-syslog-server.ps1`;

  const firewallCmds = `New-NetFirewallRule -DisplayName "Sophos Syslog UDP 5514" -Direction Inbound -Protocol UDP -LocalPort 5514 -Action Allow\nNew-NetFirewallRule -DisplayName "Sophos Syslog TCP 5514" -Direction Inbound -Protocol TCP -LocalPort 5514 -Action Allow`;

  const testCmd = `python syslog-server\\send-test-syslog.py --host 127.0.0.1 --port 5514 --protocol udp`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-mono select-none">
      
      {/* Header Banner */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#07111e] border border-[#1f3354] text-[#00a3e0]">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a3e0]">
                WINDOWS_11_SERVER_DEPLOYMENT_GUIDE
              </span>
            </div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SOPHOS_FIREWALL_RECEIVER_INTEGRATION
            </h2>
            <p className="text-[10px] text-[#8ea8cb]">
              Step-by-step procedure to initialize the Python listener daemon and route SFOS logs
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Install Python & Launch Service */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0066cc] font-mono text-[10px] font-bold text-white">
            1
          </span>
          <h3 className="text-xs font-bold text-white uppercase">LAUNCH_RECEIVER_SERVICE</h3>
        </div>

        <p className="text-[11px] text-[#a2bdde] leading-relaxed">
          Open PowerShell on your Windows log collector host and run the launcher script. Uses Python socket library with zero third-party dependencies.
        </p>

        <div className="relative rounded border border-[#1f3354] bg-[#050c17] p-3 font-mono text-xs text-[#00a3e0]">
          <button
            onClick={() => copyToClipboard(startCmd, setCopiedStart)}
            className="absolute right-2 top-2 flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#13253f]"
          >
            {copiedStart ? <Check size={11} className="text-[#00a3e0]" /> : <Copy size={11} />}
            {copiedStart ? "COPIED" : "COPY"}
          </button>
          <pre>{startCmd}</pre>
        </div>
      </div>

      {/* Step 2: Configure Windows Firewall Rules */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0066cc] font-mono text-[10px] font-bold text-white">
            2
          </span>
          <h3 className="text-xs font-bold text-white uppercase">CONFIGURE_FIREWALL_RULES</h3>
        </div>

        <p className="text-[11px] text-[#a2bdde] leading-relaxed">
          Permit inbound UDP & TCP traffic on port 5514 through Windows Defender Firewall.
        </p>

        <div className="relative rounded border border-[#1f3354] bg-[#050c17] p-3 font-mono text-xs text-[#00a3e0]">
          <button
            onClick={() => copyToClipboard(firewallCmds, setCopiedRule1)}
            className="absolute right-2 top-2 flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#13253f]"
          >
            {copiedRule1 ? <Check size={11} className="text-[#00a3e0]" /> : <Copy size={11} />}
            {copiedRule1 ? "COPIED" : "COPY"}
          </button>
          <pre>{firewallCmds}</pre>
        </div>
      </div>

      {/* Step 3: Configure Sophos Firewall Admin Console */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0066cc] font-mono text-[10px] font-bold text-white">
            3
          </span>
          <h3 className="text-xs font-bold text-white uppercase">SOPHOS_SFOS_CONSOLE_SETUP</h3>
        </div>

        <p className="text-[11px] text-[#a2bdde] leading-relaxed">
          Log into Sophos Firewall Admin Console (SFOS) and register the Windows collector as a Syslog server:
        </p>

        <div className="grid gap-2 sm:grid-cols-2 text-[10px]">
          <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5 space-y-1">
            <span className="block font-bold text-white uppercase">1. NAVIGATION_PATH</span>
            <p className="text-[#8ea8cb]">Configure → System → System services → Log settings</p>
          </div>

          <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5 space-y-1">
            <span className="block font-bold text-white uppercase">2. SYSLOG_SERVER_ENTRY</span>
            <p className="text-[#8ea8cb]">Click 'Add' → Name: SyslogReceiver → IP: Host IP → Port: 5514</p>
          </div>

          <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5 space-y-1">
            <span className="block font-bold text-white uppercase">3. PROTOCOL_FORMAT</span>
            <p className="text-[#8ea8cb]">Select 'Standard syslog' protocol (RFC 5424 formatted)</p>
          </div>

          <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5 space-y-1">
            <span className="block font-bold text-white uppercase">4. LOG_MODULES</span>
            <p className="text-[#8ea8cb]">Enable Firewall, Auth, System, VPN, ATP, IPS, WAF modules</p>
          </div>
        </div>
      </div>

      {/* Step 4: Test Connectivity */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0066cc] font-mono text-[10px] font-bold text-white">
            4
          </span>
          <h3 className="text-xs font-bold text-white uppercase">TEST_TRANSMISSION</h3>
        </div>

        <p className="text-[11px] text-[#a2bdde] leading-relaxed">
          Verify transmission using the included Python test generator script or the web-based Packet Injector.
        </p>

        <div className="relative rounded border border-[#1f3354] bg-[#050c17] p-3 font-mono text-xs text-[#00a3e0]">
          <button
            onClick={() => copyToClipboard(testCmd, setCopiedRule2)}
            className="absolute right-2 top-2 flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#13253f]"
          >
            {copiedRule2 ? <Check size={11} className="text-[#00a3e0]" /> : <Copy size={11} />}
            {copiedRule2 ? "COPIED" : "COPY"}
          </button>
          <pre>{testCmd}</pre>
        </div>
      </div>

    </div>
  );
};
