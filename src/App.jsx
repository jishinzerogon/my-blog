import { useState, useEffect } from "react";

/* ─── DATA ─── */
const STATS = {
  name: "自信なさげなどらごん",
  title: "Lv.6 Infrastructure Engineer",
  titleTooltip: "Lv = エンジニア歴（年数）",
  subtitle: "Corporate IT → Server-Side Engineer → Infrastructure Engineer",
  hp: { current: 999, max: 999, label: "HP", tooltip: "やる気 — モチベーション" },
  mp: { current: 6, max: 8, label: "MP", tooltip: "実務経験のある技術領域 — 6/8 領域" },
  exp: { current: 6, max: 10, label: "EXP", tooltip: "エンジニア歴 — 6年目" },
};

const MAX_YEARS = 6; // max bar scale

const SKILLS = [
  { name: "Linux", years: 6, element: "🐧", color: "#FCC624", tags: ["Amazon Linux", "CentOS"] },
  { name: "AWS", years: 2, element: "☁", color: "#FF9900", tags: ["EC2", "VPC", "ELB", "RDS", "Lambda", "API Gateway", "Route53"] },
  { name: "Terraform", years: 2, element: "⬡", color: "#7B42BC", tags: ["State管理", "モジュール化", "リファクタリング"] },
  { name: "Ansible", years: 2, element: "⚙", color: "#EE0000", tags: ["Playbook", "role設計", "inventory", "リファクタリング"] },
  { name: "Monitoring", years: 2, element: "👁", color: "#E6522C", tags: ["Prometheus", "Grafana", "Alertmanager", "Zabbix"] },
  { name: "Python / Shell", years: 2, element: "🐍", color: "#3776AB", tags: ["Lambda", "インスタンス制御", "AMI削除", "証明書配布"] },
  { name: "Ruby on Rails", years: 1, element: "💎", color: "#CC342D", tags: ["ポータルサイト開発", "社内Webツール"] },
  { name: "Docker", years: 0.5, element: "🐋", color: "#2496ED", tags: ["学習中", "Dockerfile", "個人開発"] },
];

const QUESTS = [
  { period: "2024 - Present", title: "☆ インフラエンジニア", guild: "ゲーム会社（現職）", desc: "AWS環境でのゲームインフラ構築・運用。Terraform/Ansibleによるコード化、Prometheus/Grafanaでの監視基盤構築。サーバ縮退プロジェクトを主導し、月額インフラコスト約80%削減を達成。", status: "active" },
  { period: "2023", title: "★ Web開発エンジニア", guild: "ゲーム会社", desc: "Ruby on Railsを用いたゲームポータルサイトの開発・保守。キャンペーン施策によるWeb変更、会社譲渡に伴うドメイン・SSL対応など。", status: "complete" },
  { period: "2020 - 2022", title: "★ 社内SE", guild: "ゲーム会社", desc: "社内PCの管理・キッティング、ヘルプデスク、オンプレミスサーバーの構築・運用。ITインフラの基礎を習得。", status: "complete" },
];

const INVENTORY = [
  { name: "AWS Solutions Architect Associate", rarity: "epic", icon: "☁", year: "2026" },
  { name: "基本情報技術者", rarity: "rare", icon: "📜", year: "2022" },
  { name: "ITパスポート", rarity: "rare", icon: "📜", year: "2020" },
];

const POSTS = [
  { title: "ECS Fargateでゲーム用ブログサーバーを構築した話", date: "2025-04-10", tags: ["AWS", "ECS"], exp: 120 },
  { title: "大規模ゲームイベントを支えるインフラ設計", date: "2025-03-22", tags: ["設計", "負荷対策"], exp: 200 },
  { title: "GitHub ActionsでゲームサーバーのCI/CDを自動化", date: "2025-03-05", tags: ["CI/CD", "自動化"], exp: 150 },
];

const RARITY_COLORS = {
  legendary: { bg: "#FF9900", text: "#1a0a00", glow: "#FF990066", label: "★★★★★" },
  epic: { bg: "#a855f7", text: "#1a001a", glow: "#a855f766", label: "★★★★☆" },
  rare: { bg: "#3b82f6", text: "#001a33", glow: "#3b82f666", label: "★★★☆☆" },
};

/* ─── COST DATA (dummy — will be replaced by API) ─── */
const COST_DATA = {
  monthlyTotal: 12.47,
  dailyAverage: 0.41,
  todayCost: 0.38,
  lastUpdated: "2025-04-16 09:00 JST",
  currency: "USD",
  services: [
    { name: "ECS Fargate", cost: 5.12, icon: "⚙", color: "#FF9900", rpgName: "召喚獣維持費" },
    { name: "ALB", cost: 2.88, icon: "🛡", color: "#f59e0b", rpgName: "結界維持費" },
    { name: "Route 53", cost: 1.50, icon: "🧭", color: "#8b5cf6", rpgName: "転送魔法陣使用料" },
    { name: "ECR", cost: 1.20, icon: "📦", color: "#3b82f6", rpgName: "アイテム保管庫" },
    { name: "CloudWatch", cost: 0.92, icon: "👁", color: "#22c55e", rpgName: "千里眼の水晶" },
    { name: "S3", cost: 0.53, icon: "🗄", color: "#06b6d4", rpgName: "古文書保管庫" },
    { name: "Data Transfer", cost: 0.32, icon: "🌐", color: "#ec4899", rpgName: "テレポート通信費" },
  ],
  dailyTrend: [
    0.35, 0.38, 0.42, 0.39, 0.41, 0.44, 0.40,
    0.37, 0.43, 0.45, 0.38, 0.36, 0.39, 0.42,
    0.41, 0.38, 0.44, 0.46, 0.43, 0.40, 0.37,
    0.39, 0.42, 0.41, 0.38, 0.40, 0.43, 0.39,
    0.41, 0.38,
  ],
  monthlyTrend: [
    { month: "Nov", cost: 10.20 },
    { month: "Dec", cost: 11.80 },
    { month: "Jan", cost: 11.50 },
    { month: "Feb", cost: 12.10 },
    { month: "Mar", cost: 12.30 },
    { month: "Apr", cost: 12.47 },
  ],
};

/* ─── COMPONENTS ─── */

function PixelBorder({ children, style, glowing, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#0c0e1a",
        border: "2px solid #2a2e4a",
        borderRadius: 2,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        boxShadow: glowing ? "0 0 16px #4a6cf733, inset 0 0 20px #0a0c1a" : "inset 0 0 20px #0a0c1a",
        transition: "box-shadow 0.3s",
        ...style,
      }}
    >
      {["top:0;left:0", "top:0;right:0", "bottom:0;left:0", "bottom:0;right:0"].map((pos, i) => {
        const s = {};
        pos.split(";").forEach(p => { const [k, v] = p.split(":"); s[k] = v; });
        return (
          <div key={i} style={{
            position: "absolute", width: 6, height: 6,
            borderTop: s.top !== undefined ? "2px solid #4a6cf7" : "none",
            borderBottom: s.bottom !== undefined ? "2px solid #4a6cf7" : "none",
            borderLeft: s.left !== undefined ? "2px solid #4a6cf7" : "none",
            borderRight: s.right !== undefined ? "2px solid #4a6cf7" : "none",
            ...s, zIndex: 2,
          }} />
        );
      })}
      {children}
    </div>
  );
}

function Tooltip({ text, children, inline }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: inline ? "inline-flex" : "flex", width: inline ? undefined : "100%" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "#1a1d30", border: "1px solid #4a6cf744", borderRadius: 3,
          padding: "6px 10px", fontSize: 10, color: "#c5cbe3", whiteSpace: "nowrap",
          zIndex: 100, boxShadow: "0 4px 12px #00000066", animation: "fadeIn 0.15s ease",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8, background: "#1a1d30", borderRight: "1px solid #4a6cf744",
            borderBottom: "1px solid #4a6cf744",
          }} />
          {text}
        </div>
      )}
    </div>
  );
}

function GaugeBar({ current, max, color, height = 14, label, showText = true, tooltip }) {
  const [animWidth, setAnimWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimWidth((current / max) * 100), 200);
    return () => clearTimeout(t);
  }, [current, max]);

  return (
    <Tooltip text={tooltip || ""}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", cursor: tooltip ? "help" : "default" }}>
        {label && <span style={{ color: "#8890b5", fontSize: 11, fontWeight: 700, width: 28, textAlign: "right" }}>{label}</span>}
        <div style={{ flex: 1, height, background: "#1a1d30", borderRadius: 1, border: "1px solid #2a2e4a", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 2, backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${height - 2}px, #0c0e1a44 ${height - 2}px, #0c0e1a44 ${height}px)` }} />
          <div style={{ height: "100%", width: `${animWidth}%`, background: `linear-gradient(180deg, ${color}, ${color}aa)`, boxShadow: `0 0 8px ${color}44`, transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)", position: "relative", zIndex: 1 }} />
        </div>
        {showText && <span style={{ color: "#8890b5", fontSize: 10, fontFamily: "inherit", width: 64, textAlign: "right" }}>{current}/{max}</span>}
      </div>
    </Tooltip>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 8,
    duration: 6 + Math.random() * 6, size: 2 + Math.random() * 3, opacity: 0.15 + Math.random() * 0.25,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, bottom: -10, width: p.size, height: p.size,
          borderRadius: "50%", background: "#4a6cf7", opacity: p.opacity,
          animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─── COST CHART COMPONENTS ─── */

function MiniBarChart({ services }) {
  const maxCost = Math.max(...services.map(s => s.cost));
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {services.map((svc, i) => (
        <div key={svc.name} style={{
          animation: "slideUp 0.4s ease both", animationDelay: `${i * 60}ms`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>{svc.icon}</span>
              <span style={{ color: "#c5cbe3", fontSize: 11 }}>{svc.name}</span>
              <span style={{ color: "#4a5578", fontSize: 9 }}>({svc.rpgName})</span>
            </div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#eab308" }}>
              ${svc.cost.toFixed(2)}
            </span>
          </div>
          <div style={{ height: 10, background: "#1a1d30", borderRadius: 1, border: "1px solid #2a2e4a22", overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%",
              width: animate ? `${(svc.cost / maxCost) * 100}%` : "0%",
              background: `linear-gradient(90deg, ${svc.color}88, ${svc.color})`,
              borderRadius: 1,
              transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
              transitionDelay: `${i * 80}ms`,
              boxShadow: `0 0 6px ${svc.color}33`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SparkLine({ data, width = 480, height = 100, color = "#eab308" }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 500); return () => clearTimeout(t); }, []);

  const max = Math.max(...data) * 1.15;
  const min = Math.min(...data) * 0.85;
  const range = max - min;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height,
  }));

  const pathD = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + stepX * 0.4;
    const cpx2 = p.x - stepX * 0.4;
    return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Y-axis labels
  const yLabels = [min, min + range * 0.5, max].map(v => ({
    value: `$${v.toFixed(2)}`,
    y: height - ((v - min) / range) * height,
  }));

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`-40 -10 ${width + 50} ${height + 30}`} style={{
        opacity: show ? 1 : 0, transition: "opacity 0.8s ease",
      }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((yl, i) => (
          <g key={i}>
            <line x1={0} y1={yl.y} x2={width} y2={yl.y} stroke="#1a1d30" strokeWidth={1} strokeDasharray="4 4" />
            <text x={-8} y={yl.y + 3} textAnchor="end" fill="#4a5578" fontSize={8} fontFamily="'M PLUS 1 Code', monospace">{yl.value}</text>
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 9, 19, 29].map(i => (
          <text key={i} x={i * stepX} y={height + 16} textAnchor="middle" fill="#4a5578" fontSize={8} fontFamily="'M PLUS 1 Code', monospace">
            {i + 1}日
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth={2} strokeLinecap="round" />

        {/* End dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={color} opacity={0.9}>
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* End value label */}
        <text x={points[points.length - 1].x} y={points[points.length - 1].y - 10} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold" fontFamily="'Press Start 2P', monospace">
          ${data[data.length - 1].toFixed(2)}
        </text>
      </svg>
    </div>
  );
}

function MonthlyTrendBars({ data }) {
  const max = Math.max(...data.map(d => d.cost)) * 1.15;
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 400); return () => clearTimeout(t); }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => {
        const isLatest = i === data.length - 1;
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7, color: isLatest ? "#eab308" : "#6b7199",
            }}>
              ${d.cost.toFixed(1)}
            </span>
            <div style={{
              width: "100%", maxWidth: 36,
              height: animate ? `${(d.cost / max) * 60}px` : "0px",
              background: isLatest
                ? "linear-gradient(180deg, #eab308, #b45309)"
                : "linear-gradient(180deg, #2a2e4a, #1a1d30)",
              border: `1px solid ${isLatest ? "#eab30844" : "#2a2e4a"}`,
              borderRadius: "2px 2px 0 0",
              transition: "height 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              transitionDelay: `${i * 100}ms`,
              boxShadow: isLatest ? "0 0 10px #eab30833" : "none",
            }} />
            <span style={{ fontSize: 9, color: isLatest ? "#eab308" : "#6b7199" }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN ─── */
export default function GamePortfolio() {
  const [activeTab, setActiveTab] = useState("status");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMenuVisible(true), 300);
    const t2 = setTimeout(() => setContentVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    setContentVisible(false);
    const t = setTimeout(() => setContentVisible(true), 150);
    return () => clearTimeout(t);
  }, [activeTab]);

  const tabs = [
    { id: "status", label: "自己紹介", sub: "ステータス", icon: "♦" },
    { id: "skills", label: "技術スキル", sub: "スキル", icon: "✦" },
    { id: "quests", label: "経歴", sub: "クエストログ", icon: "⚑" },
    { id: "inventory", label: "資格", sub: "装備", icon: "◈" },
    { id: "log", label: "ブログ", sub: "冒険記録", icon: "📖" },
    { id: "treasury", label: "コスト", sub: "ギルド金庫", icon: "💰" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080a14", color: "#c5cbe3",
      fontFamily: "'DotGothic16', 'M PLUS 1 Code', 'Courier New', monospace",
      fontSize: 14, lineHeight: 1.7, position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+1+Code:wght@300;400;500;700&family=Press+Start+2P&display=swap');
        @keyframes particleFloat { 0%{transform:translateY(0) scale(1);opacity:var(--o)} 100%{transform:translateY(-100vh) scale(0.3);opacity:0} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{text-shadow:0 0 4px #4a6cf744} 50%{text-shadow:0 0 12px #4a6cf788} }
        @keyframes goldGlow { 0%,100%{text-shadow:0 0 4px #eab30844} 50%{text-shadow:0 0 16px #eab30888} }
        @keyframes borderPulse { 0%,100%{border-color:#2a2e4a} 50%{border-color:#4a6cf755} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes coinSpin { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(360deg)} }
        @keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #4a6cf744; color: #fff; }
      `}</style>

      <FloatingParticles />

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.025,
        backgroundImage: `linear-gradient(45deg, #4a6cf7 1px, transparent 1px), linear-gradient(-45deg, #4a6cf7 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 10,
        background: "linear-gradient(180deg, #0f1229 0%, #080a14 100%)",
        borderBottom: "2px solid #2a2e4a", padding: "20px 24px 16px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{
              width: 56, height: 56, background: "linear-gradient(135deg, #1a1d30, #2a2e4a)",
              border: "2px solid #4a6cf7", borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              boxShadow: "0 0 12px #4a6cf733", animation: "borderPulse 3s ease infinite",
            }}>⚔</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontFamily: "'Press Start 2P', 'DotGothic16', monospace", fontSize: 16, color: "#e2e8ff", letterSpacing: 2, animation: "glow 3s ease infinite" }}>{STATS.name}</h1>
              <Tooltip text={STATS.titleTooltip} inline>
                <div style={{ color: "#4a6cf7", fontSize: 12, marginTop: 4, fontWeight: 700, cursor: "help" }}>{STATS.title}</div>
              </Tooltip>
              <div style={{ color: "#6b7199", fontSize: 11, marginTop: 2 }}>{STATS.subtitle}</div>
            </div>
            <div style={{ width: 240 }}>
              <div style={{ marginBottom: 4 }}><GaugeBar current={STATS.hp.current} max={STATS.hp.max} color="#22c55e" label={STATS.hp.label} height={10} tooltip={STATS.hp.tooltip} /></div>
              <div style={{ marginBottom: 4 }}><GaugeBar current={STATS.mp.current} max={STATS.mp.max} color="#3b82f6" label={STATS.mp.label} height={10} tooltip={STATS.mp.tooltip} /></div>
              <div><GaugeBar current={STATS.exp.current} max={STATS.exp.max} color="#eab308" label={STATS.exp.label} height={8} tooltip={STATS.exp.tooltip} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "20px 24px 80px",
        position: "relative", zIndex: 10, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap",
      }}>
        {/* Left menu */}
        <div style={{
          width: 160, opacity: menuVisible ? 1 : 0,
          transform: menuVisible ? "translateX(0)" : "translateX(-20px)",
          transition: "all 0.5s ease", flexShrink: 0,
        }}>
          <PixelBorder style={{ padding: 6 }}>
            <div style={{ padding: "4px 0" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, padding: "4px 10px", letterSpacing: 2, borderBottom: "1px solid #1a1d30", marginBottom: 2 }}>MENU</div>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  background: activeTab === tab.id ? "#1a1d30" : "transparent",
                  color: activeTab === tab.id ? (tab.id === "treasury" ? "#eab308" : "#4a6cf7") : "#6b7199",
                  border: "none",
                  borderLeft: activeTab === tab.id ? `2px solid ${tab.id === "treasury" ? "#eab308" : "#4a6cf7"}` : "2px solid transparent",
                  padding: "7px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                }}>
                  <span style={{ fontSize: 12, width: 16, textAlign: "center", flexShrink: 0 }}>{tab.icon}</span>
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                    <span style={{ fontSize: 11 }}>{tab.label}</span>
                    <span style={{ fontSize: 8, color: "#4a5578", fontStyle: "normal" }}>{tab.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </PixelBorder>

          <PixelBorder style={{ padding: 10, marginTop: 12 }}>
            <div style={{ color: "#4a6cf7", fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>INFRA MAP</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 9, color: "#6b7199" }}>
              {["GitHub", "↓", "Actions", "↓", "ECR → Fargate", "↓", "ALB → Route53"].map((item, i) => (
                <span key={i} style={{ color: item === "↓" ? "#2a2e4a" : (item.includes("Fargate") ? "#FF9900" : "#8890b5"), fontWeight: item === "↓" ? 400 : 500, textAlign: "center" }}>{item}</span>
              ))}
            </div>
          </PixelBorder>
        </div>

        {/* Right content */}
        <div style={{
          flex: 1, minWidth: 0, opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(8px)", transition: "all 0.3s ease",
        }}>

          {/* STATUS */}
          {activeTab === "status" && (
            <div>
              <PixelBorder style={{ padding: "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>♦ PROFILE <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— ステータス</span></div>
                <p style={{ color: "#c5cbe3", fontSize: 13, lineHeight: 2 }}>
                  ゲーム業界でインフラエンジニアとして活動中。<br />
                  オンラインゲームのサーバー基盤設計からリリース後の運用まで、<br />
                  「プレイヤーが快適に遊べるインフラ」を支えることが使命。
                </p>
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#0f1229", border: "1px solid #1a1d30", borderRadius: 2, fontSize: 12, color: "#6b7199", lineHeight: 2 }}>
                  <span style={{ color: "#4a6cf7" }}>▸ 得意分野：</span>
                  大規模ゲームイベント時の負荷対策 / リアルタイム通信基盤 / コンテナオーケストレーション
                </div>
              </PixelBorder>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { label: "総クエストクリア数", value: "47", sub: "プロジェクト完了" },
                  { label: "最大同時接続耐性", value: "500K+", sub: "concurrent users" },
                  { label: "インフラ稼働率", value: "99.99%", sub: "SLA達成" },
                  { label: "デプロイ回数", value: "1,200+", sub: "CI/CD パイプライン" },
                ].map((stat, i) => (
                  <PixelBorder key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ color: "#6b7199", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: "#e2e8ff", textShadow: "0 0 8px #4a6cf744" }}>{stat.value}</div>
                    <div style={{ color: "#4a6cf7", fontSize: 10, marginTop: 4 }}>{stat.sub}</div>
                  </PixelBorder>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === "skills" && (
            <PixelBorder style={{ padding: "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>✦ SKILLS <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 技術スキル</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                {SKILLS.map((skill, i) => (
                  <div key={skill.name} onClick={() => setSelectedSkill(selectedSkill === i ? null : i)} style={{
                    background: selectedSkill === i ? "#1a1d30" : "#0f1229",
                    border: `1px solid ${selectedSkill === i ? skill.color + "66" : "#1a1d30"}`,
                    borderRadius: 2, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s",
                    animation: "slideUp 0.4s ease both", animationDelay: `${i * 80}ms`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{skill.element}</span>
                        <span style={{ color: "#e2e8ff", fontSize: 13, fontWeight: 600 }}>{skill.name}</span>
                      </div>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: skill.color }}>
                        {skill.years}yr
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ color: "#6b7199", fontSize: 9, flexShrink: 0 }}>経験 {skill.years}年</span>
                    </div>
                    <GaugeBar current={skill.years} max={MAX_YEARS} color={skill.color} height={8} showText={false} />
                    {/* Tags always visible */}
                    <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                      {skill.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 9, color: skill.color, background: `${skill.color}11`,
                          border: `1px solid ${skill.color}22`, padding: "1px 7px", borderRadius: 2,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PixelBorder>
          )}

          {/* QUESTS */}
          {activeTab === "quests" && (
            <PixelBorder style={{ padding: "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>⚑ CAREER <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— クエストログ</span></div>
              {QUESTS.map((quest, i) => (
                <div key={i} style={{
                  background: "#0f1229", border: `1px solid ${quest.status === "active" ? "#4a6cf744" : "#1a1d30"}`,
                  borderRadius: 2, padding: "16px 18px", marginBottom: 12, position: "relative",
                  animation: "slideUp 0.4s ease both", animationDelay: `${i * 150}ms`,
                }}>
                  {quest.status === "active" && <div style={{ position: "absolute", top: 8, right: 12, background: "#22c55e22", color: "#22c55e", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 2, border: "1px solid #22c55e44", letterSpacing: 1 }}>ACTIVE</div>}
                  {quest.status === "complete" && <div style={{ position: "absolute", top: 8, right: 12, color: "#6b7199", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>COMPLETE ✓</div>}
                  <div style={{ color: "#e2e8ff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{quest.title}</div>
                  <div style={{ color: "#4a6cf7", fontSize: 12, marginBottom: 2 }}>{quest.guild}</div>
                  <div style={{ color: "#6b7199", fontSize: 10, marginBottom: 8 }}>{quest.period}</div>
                  <p style={{ color: "#8890b5", fontSize: 12, lineHeight: 1.8 }}>{quest.desc}</p>
                </div>
              ))}
            </PixelBorder>
          )}

          {/* INVENTORY */}
          {activeTab === "inventory" && (
            <PixelBorder style={{ padding: "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>◈ CERTIFICATIONS <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 装備・資格</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {INVENTORY.map((item, i) => {
                  const r = RARITY_COLORS[item.rarity];
                  return (
                    <div key={i} style={{
                      background: "#0f1229", border: `1px solid ${r.bg}33`, borderRadius: 2,
                      padding: "14px 16px", position: "relative", overflow: "hidden",
                      animation: "slideUp 0.4s ease both", animationDelay: `${i * 120}ms`,
                    }}>
                      {item.rarity === "legendary" && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent 30%, ${r.bg}0a 50%, transparent 70%)`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />}
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 22, filter: `drop-shadow(0 0 4px ${r.glow})` }}>{item.icon}</span>
                            <div>
                              <div style={{ color: "#e2e8ff", fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                              <div style={{ color: r.bg, fontSize: 10, marginTop: 2, letterSpacing: 1 }}>{r.label}</div>
                            </div>
                          </div>
                          <span style={{ color: "#6b7199", fontSize: 10 }}>{item.year}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PixelBorder>
          )}

          {/* LOG */}
          {activeTab === "log" && (
            <PixelBorder style={{ padding: "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>📖 BLOG <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 冒険記録</span></div>
              {POSTS.map((post, i) => (
                <div key={i} style={{
                  background: "#0f1229", border: "1px solid #1a1d30", borderRadius: 2,
                  padding: "14px 18px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s",
                  animation: "slideUp 0.4s ease both", animationDelay: `${i * 100}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a6cf744"; e.currentTarget.style.background = "#12152a"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1d30"; e.currentTarget.style.background = "#0f1229"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ color: "#e2e8ff", fontSize: 13, fontWeight: 500 }}>
                      <span style={{ color: "#4a6cf7", marginRight: 8 }}>▸</span>{post.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#eab308", fontSize: 10, fontWeight: 700, background: "#eab30811", padding: "2px 6px", borderRadius: 2 }}>+{post.exp} EXP</span>
                      <span style={{ color: "#6b7199", fontSize: 11 }}>{post.date}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, color: "#4a6cf7", background: "#4a6cf711", border: "1px solid #4a6cf722", padding: "1px 8px", borderRadius: 2 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </PixelBorder>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* TREASURY — COST DASHBOARD                  */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === "treasury" && (
            <div>
              {/* Header banner */}
              <PixelBorder glowing style={{ padding: "20px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                {/* Gold shimmer bg */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 20%, #eab30806 50%, transparent 80%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 4s linear infinite",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                    💰 INFRA COST <span style={{ color: "#b4891888", fontWeight: 400, letterSpacing: 0 }}>— ギルド金庫</span>
                  </div>
                  <div style={{ color: "#6b7199", fontSize: 10, marginBottom: 16 }}>
                    このサイトの実際のAWSインフラ維持費をリアルタイムで公開しています。
                    <br />
                    <span style={{ color: "#4a5578" }}>最終更新: {COST_DATA.lastUpdated} ｜ via AWS Cost Explorer API + Lambda</span>
                  </div>

                  {/* Big cost cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "今月の維持費", value: COST_DATA.monthlyTotal, icon: "🪙", sub: "Monthly Total" },
                      { label: "本日の維持費", value: COST_DATA.todayCost, icon: "⚡", sub: "Today's Cost" },
                      { label: "日平均コスト", value: COST_DATA.dailyAverage, icon: "📊", sub: "Daily Average" },
                    ].map((card, i) => (
                      <div key={i} style={{
                        background: "#0f1229",
                        border: "1px solid #eab30822",
                        borderRadius: 2,
                        padding: "14px 12px",
                        textAlign: "center",
                        animation: "countUp 0.5s ease both",
                        animationDelay: `${i * 150}ms`,
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{card.icon}</div>
                        <div style={{ color: "#6b7199", fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{card.label}</div>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: 18,
                          color: "#eab308",
                          animation: "goldGlow 3s ease infinite",
                        }}>
                          ${card.value.toFixed(2)}
                        </div>
                        <div style={{ color: "#4a5578", fontSize: 9, marginTop: 4 }}>{card.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </PixelBorder>

              {/* Service breakdown */}
              <PixelBorder style={{ padding: "20px 24px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
                    ⚙ サービス別コスト内訳 <span style={{ color: "#4a5578", fontWeight: 400 }}>— 魔力消費量</span>
                  </div>
                  <span style={{ color: "#4a5578", fontSize: 9 }}>
                    合計: <span style={{ color: "#eab308" }}>${COST_DATA.monthlyTotal.toFixed(2)}</span>
                  </span>
                </div>
                <MiniBarChart services={COST_DATA.services} />
              </PixelBorder>

              {/* Daily trend */}
              <PixelBorder style={{ padding: "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                  📈 日別コスト推移（直近30日）<span style={{ color: "#4a5578", fontWeight: 400 }}> — デイリーログ</span>
                </div>
                <SparkLine data={COST_DATA.dailyTrend} />
              </PixelBorder>

              {/* Monthly trend */}
              <PixelBorder style={{ padding: "20px 24px" }}>
                <div style={{ color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  📅 月別コスト推移 <span style={{ color: "#4a5578", fontWeight: 400 }}>— シーズン報告</span>
                </div>
                <MonthlyTrendBars data={COST_DATA.monthlyTrend} />
                <div style={{
                  marginTop: 16, paddingTop: 12, borderTop: "1px solid #1a1d30",
                  color: "#4a5578", fontSize: 10, lineHeight: 1.8,
                }}>
                  <span style={{ color: "#eab308" }}>💡 運用メモ（ギルドマスターより）：</span><br />
                  個人ブログとしてはかなり低コストで運用できています。ECS Fargateの最小構成（0.25 vCPU / 0.5 GB）を使用中。
                  このコストデータはLambda + Cost Explorer APIで毎日自動取得しています。
                </div>
              </PixelBorder>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 10, borderTop: "2px solid #1a1d30",
        padding: "16px 24px", textAlign: "center", color: "#3a3f5c", fontSize: 10, letterSpacing: 1, background: "#080a14",
      }}>
        © 2025 {STATS.name} — Built with React + Vite on ECS Fargate
        <br />
        <span style={{ color: "#2a2e4a" }}>☁ Powered by AWS — GAME OVER? NEVER.</span>
      </div>
    </div>
  );
}
