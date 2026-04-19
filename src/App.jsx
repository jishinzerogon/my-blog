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

const MAX_YEARS = 6;

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

const POSTS = [];

const RARITY_COLORS = {
  legendary: { bg: "#FF9900", text: "#1a0a00", glow: "#FF990066", label: "★★★★★" },
  epic: { bg: "#a855f7", text: "#1a001a", glow: "#a855f766", label: "★★★★☆" },
  rare: { bg: "#3b82f6", text: "#001a33", glow: "#3b82f666", label: "★★★☆☆" },
};

const TIMELINE = [];

const CONTACTS = [
  { name: "GitHub", icon: "◈", url: "https://github.com/jishinzerogon", color: "#c9d1d9", desc: "ソースコード & コントリビューション" },
];

/* ─── HOOKS ─── */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

/* ─── COMPONENTS ─── */
function Tooltip({ text, children, inline }) {
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile();
  return (
    <div style={{ position: "relative", display: inline ? "inline-flex" : "flex", width: inline ? undefined : "100%" }}
      onMouseEnter={() => !isMobile && setShow(true)} onMouseLeave={() => setShow(false)}
      onClick={() => isMobile && setShow(s => !s)}
    >
      {children}
      {show && text && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "#1a1d30", border: "1px solid #4a6cf744", borderRadius: 3,
          padding: "6px 10px", fontSize: 10, color: "#c5cbe3", whiteSpace: "nowrap",
          zIndex: 100, boxShadow: "0 4px 12px #00000066", animation: "fadeIn 0.15s ease",
          pointerEvents: "none", maxWidth: "80vw",
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

function PixelBorder({ children, style, glowing, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#0c0e1a", border: "2px solid #2a2e4a", borderRadius: 2, position: "relative",
      cursor: onClick ? "pointer" : "default",
      boxShadow: glowing ? "0 0 16px #4a6cf733, inset 0 0 20px #0a0c1a" : "inset 0 0 20px #0a0c1a",
      transition: "box-shadow 0.3s", ...style,
    }}>
      {["top:0;left:0","top:0;right:0","bottom:0;left:0","bottom:0;right:0"].map((pos, i) => {
        const s = {};
        pos.split(";").forEach(p => { const [k,v] = p.split(":"); s[k] = v; });
        return <div key={i} style={{
          position: "absolute", width: 6, height: 6,
          borderTop: s.top !== undefined ? "2px solid #4a6cf7" : "none",
          borderBottom: s.bottom !== undefined ? "2px solid #4a6cf7" : "none",
          borderLeft: s.left !== undefined ? "2px solid #4a6cf7" : "none",
          borderRight: s.right !== undefined ? "2px solid #4a6cf7" : "none",
          ...s, zIndex: 2,
        }} />;
      })}
      {children}
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
          <div style={{ position: "absolute", inset: 0, zIndex: 2, backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${height-2}px, #0c0e1a44 ${height-2}px, #0c0e1a44 ${height}px)` }} />
          <div style={{ height: "100%", width: `${animWidth}%`, background: `linear-gradient(180deg, ${color}, ${color}aa)`, boxShadow: `0 0 8px ${color}44`, transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)", position: "relative", zIndex: 1 }} />
        </div>
        {showText && <span style={{ color: "#8890b5", fontSize: 10, fontFamily: "inherit", width: 64, textAlign: "right" }}>{current}/{max}</span>}
      </div>
    </Tooltip>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i, left: Math.random()*100, delay: Math.random()*8,
    duration: 6+Math.random()*6, size: 2+Math.random()*3, opacity: 0.15+Math.random()*0.25,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map(p => <div key={p.id} style={{
        position: "absolute", left: `${p.left}%`, bottom: -10, width: p.size, height: p.size,
        borderRadius: "50%", background: "#4a6cf7", opacity: p.opacity,
        animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
      }} />)}
    </div>
  );
}

/* ─── MOBILE MENU BUTTON ─── */
function HamburgerButton({ open, onClick }) {
  const bar = { width: 18, height: 2, background: "#4a6cf7", borderRadius: 1, transition: "all 0.3s ease" };
  return (
    <button onClick={onClick} style={{
      background: "#0c0e1a", border: "2px solid #2a2e4a", borderRadius: 2,
      width: 40, height: 40, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer",
      flexShrink: 0,
    }}>
      <div style={{ ...bar, transform: open ? "rotate(45deg) translate(3.5px, 3.5px)" : "none" }} />
      <div style={{ ...bar, opacity: open ? 0 : 1 }} />
      <div style={{ ...bar, transform: open ? "rotate(-45deg) translate(3.5px, -3.5px)" : "none" }} />
    </button>
  );
}

/* ─── COMING SOON PLACEHOLDER ─── */
function ComingSoon({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ color: "#4a6cf7", fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>COMING SOON</div>
      <div style={{ color: "#6b7199", fontSize: 12, marginTop: 8 }}>{message}</div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function GamePortfolio() {
  const [activeTab, setActiveTab] = useState("status");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const tabs = [
    { id: "status", label: "自己紹介", sub: "ステータス", icon: "♦" },
    { id: "skills", label: "技術スキル", sub: "スキル", icon: "✦" },
    { id: "quests", label: "経歴", sub: "クエストログ", icon: "⚑" },
    { id: "inventory", label: "資格", sub: "装備", icon: "◈" },
    { id: "log", label: "ブログ", sub: "冒険記録", icon: "📖" },
    { id: "treasury", label: "コスト", sub: "ギルド金庫", icon: "💰" },
    { id: "contact", label: "お問い合わせ", sub: "ギルド受付", icon: "✉" },
  ];

  /* ─── TAB BUTTON (shared between sidebar & mobile) ─── */
  const TabButton = ({ tab, horizontal }) => (
    <button onClick={() => handleTabClick(tab.id)} style={{
      display: "flex", alignItems: "center", gap: horizontal ? 4 : 8,
      width: horizontal ? "auto" : "100%",
      background: activeTab === tab.id ? "#1a1d30" : "transparent",
      color: activeTab === tab.id ? (tab.id === "treasury" ? "#eab308" : "#4a6cf7") : "#6b7199",
      border: "none",
      borderLeft: horizontal ? "none" : (activeTab === tab.id ? `2px solid ${tab.id === "treasury" ? "#eab308" : "#4a6cf7"}` : "2px solid transparent"),
      borderBottom: horizontal ? (activeTab === tab.id ? `2px solid ${tab.id === "treasury" ? "#eab308" : "#4a6cf7"}` : "2px solid transparent") : "none",
      padding: horizontal ? "8px 10px" : "7px 10px",
      fontSize: 12, fontFamily: "inherit", cursor: "pointer",
      transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 12, width: horizontal ? "auto" : 16, textAlign: "center", flexShrink: 0 }}>{tab.icon}</span>
      {horizontal ? (
        <span style={{ fontSize: 11 }}>{tab.label}</span>
      ) : (
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
          <span style={{ fontSize: 11 }}>{tab.label}</span>
          <span style={{ fontSize: 8, color: "#4a5578" }}>{tab.sub}</span>
        </span>
      )}
    </button>
  );

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
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:400px} }
        @keyframes glow { 0%,100%{text-shadow:0 0 4px #4a6cf744} 50%{text-shadow:0 0 12px #4a6cf788} }
        @keyframes goldGlow { 0%,100%{text-shadow:0 0 4px #eab30844} 50%{text-shadow:0 0 16px #eab30888} }
        @keyframes borderPulse { 0%,100%{border-color:#2a2e4a} 50%{border-color:#4a6cf755} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #4a6cf744; color: #fff; }
      `}</style>

      <FloatingParticles />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.025,
        backgroundImage: `linear-gradient(45deg, #4a6cf7 1px, transparent 1px), linear-gradient(-45deg, #4a6cf7 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* ═══ HEADER ═══ */}
      <div style={{
        position: "relative", zIndex: 10,
        background: "linear-gradient(180deg, #0f1229 0%, #080a14 100%)",
        borderBottom: "2px solid #2a2e4a", padding: isMobile ? "14px 16px 12px" : "20px 24px 16px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, flexWrap: "wrap" }}>
            {isMobile && <HamburgerButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen(o => !o)} />}

            <div style={{
              width: isMobile ? 40 : 56, height: isMobile ? 40 : 56,
              background: "linear-gradient(135deg, #1a1d30, #2a2e4a)",
              border: "2px solid #4a6cf7", borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isMobile ? 18 : 24,
              boxShadow: "0 0 12px #4a6cf733", animation: "borderPulse 3s ease infinite",
              flexShrink: 0,
            }}>⚔</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Press Start 2P', 'DotGothic16', monospace",
                fontSize: isMobile ? 11 : 16, color: "#e2e8ff", letterSpacing: 2,
                animation: "glow 3s ease infinite",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{STATS.name}</h1>
              <Tooltip text={STATS.titleTooltip} inline>
                <div style={{ color: "#4a6cf7", fontSize: isMobile ? 10 : 12, marginTop: 3, fontWeight: 700, cursor: "help" }}>{STATS.title}</div>
              </Tooltip>
              {!isMobile && <div style={{ color: "#6b7199", fontSize: 11, marginTop: 2 }}>{STATS.subtitle}</div>}
            </div>

            <div style={{ width: isMobile ? "100%" : 240 }}>
              <div style={{ marginBottom: 4 }}><GaugeBar current={STATS.hp.current} max={STATS.hp.max} color="#22c55e" label={STATS.hp.label} height={isMobile ? 8 : 10} tooltip={STATS.hp.tooltip} /></div>
              <div style={{ marginBottom: 4 }}><GaugeBar current={STATS.mp.current} max={STATS.mp.max} color="#3b82f6" label={STATS.mp.label} height={isMobile ? 8 : 10} tooltip={STATS.mp.tooltip} /></div>
              <div><GaugeBar current={STATS.exp.current} max={STATS.exp.max} color="#eab308" label={STATS.exp.label} height={isMobile ? 6 : 8} tooltip={STATS.exp.tooltip} /></div>
            </div>
          </div>

          {isMobile && mobileMenuOpen && (
            <div style={{
              marginTop: 12, borderTop: "1px solid #2a2e4a", paddingTop: 8,
              display: "flex", flexWrap: "wrap", gap: 2,
              animation: "fadeIn 0.2s ease",
            }}>
              {tabs.map(tab => <TabButton key={tab.id} tab={tab} horizontal />)}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: isMobile ? "12px 12px 60px" : "20px 24px 80px",
        position: "relative", zIndex: 10,
        display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap",
      }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <div style={{
            width: 160, opacity: menuVisible ? 1 : 0,
            transform: menuVisible ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.5s ease", flexShrink: 0,
          }}>
            <PixelBorder style={{ padding: 6 }}>
              <div style={{ padding: "4px 0" }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, padding: "4px 10px", letterSpacing: 2, borderBottom: "1px solid #1a1d30", marginBottom: 2 }}>MENU</div>
                {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
              </div>
            </PixelBorder>
          </div>
        )}

        {/* ═══ CONTENT ═══ */}
        <div style={{
          flex: 1, minWidth: 0, opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(8px)", transition: "all 0.3s ease",
        }}>

          {/* STATUS */}
          {activeTab === "status" && (
            <div>
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>♦ PROFILE <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— ステータス</span></div>
                <p style={{ color: "#c5cbe3", fontSize: 13, lineHeight: 2.2 }}>
                  ゲーム業界でインフラエンジニアとして活動中。
                  オンラインゲームのサーバー基盤設計からリリース後の運用まで、
                  「プレイヤーが快適に遊べるインフラ」を支えることが使命です。
                </p>
                <p style={{ color: "#8890b5", fontSize: 12, lineHeight: 2, marginTop: 12 }}>
                  大規模イベント時の急激なトラフィック増にも耐えられる設計や、
                  障害発生時に素早く復旧できる運用体制の構築に力を入れてきました。
                  最近はコンテナ技術と IaC を活用したインフラの自動化・コード化を推進しています。
                </p>
                <div style={{ marginTop: 16, padding: "12px 14px", background: "#0f1229", border: "1px solid #1a1d30", borderRadius: 2, fontSize: 12, color: "#6b7199", lineHeight: 2 }}>
                  <span style={{ color: "#4a6cf7" }}>▸ 得意分野：</span>
                  AWS環境の構築・運用 / IaC (Terraform・Ansible) / コスト最適化
                </div>
              </PixelBorder>

              {/* Values / Policy */}
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  🎯 POLICY <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 大事にしていること</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "⬡", title: "Infrastructure as Code", desc: "手作業を排除し、インフラをコードで管理。再現性と変更履歴を確保する。", color: "#7B42BC" },
                    { icon: "💰", title: "コスト意識のある設計", desc: "必要十分な構成を選び、無駄なリソースを持たない。実務でも月額80%削減を達成。", color: "#eab308" },
                    { icon: "🛡", title: "障害に強い構成", desc: "落ちないインフラより、落ちても素早く復旧できるインフラを目指す。", color: "#22c55e" },
                    { icon: "⟳", title: "自動化ファースト", desc: "繰り返す作業はすべて自動化。CI/CD・監視・アラート対応まで。", color: "#40BE46" },
                  ].map((policy, i) => (
                    <div key={i} style={{
                      background: "#0f1229", border: "1px solid #1a1d30", borderRadius: 2,
                      padding: isMobile ? "12px 12px" : "14px 16px",
                      animation: "slideUp 0.4s ease both", animationDelay: `${i * 100}ms`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16, color: policy.color }}>{policy.icon}</span>
                        <span style={{ color: "#e2e8ff", fontSize: 12, fontWeight: 600 }}>{policy.title}</span>
                      </div>
                      <p style={{ color: "#6b7199", fontSize: 11, lineHeight: 1.8 }}>{policy.desc}</p>
                    </div>
                  ))}
                </div>
              </PixelBorder>

              {/* Infra Architecture Diagram */}
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  🗺 ARCHITECTURE <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— このサイトのインフラ構成</span>
                </div>

                {[
                  {
                    label: "🌐 ACCESS FLOW",
                    sub: "ユーザーのアクセス経路",
                    nodes: [
                      { name: "Cloudflare DNS", color: "#F38020", desc: "ドメイン購入元 & ネームサーバ" },
                      { name: "CloudFront", color: "#8c4fff", desc: "CDN・HTTPS終端" },
                      { name: "ALB", color: "#FF9900", desc: "ロードバランサー" },
                      { name: "ECS Fargate", color: "#FF9900", desc: "コンテナ実行環境" },
                    ],
                  },
                  {
                    label: "🚀 DEPLOY FLOW",
                    sub: "デプロイ経路",
                    nodes: [
                      { name: "GitHub", color: "#c9d1d9", desc: "ソースコード管理" },
                      { name: "GitHub Actions", color: "#2088FF", desc: "自動ビルド & デプロイ" },
                      { name: "ECR", color: "#FF9900", desc: "Dockerイメージ保存" },
                      { name: "ECS Fargate", color: "#FF9900", desc: "コンテナ実行環境" },
                    ],
                  },
                ].map((flow, fi) => (
                  <div key={fi} style={{ marginBottom: fi === 0 ? 18 : 0 }}>
                    <div style={{ color: "#6b7199", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                      {flow.label}
                      <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0, marginLeft: 6 }}>— {flow.sub}</span>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: isMobile ? 4 : 8, flexWrap: "wrap", padding: isMobile ? "6px 0" : "10px 0",
                    }}>
                      {flow.nodes.flatMap((node, ni) => {
                        const items = [
                          <Tooltip key={`n-${ni}`} text={node.desc} inline>
                            <span style={{
                              background: `${node.color}11`, color: node.color,
                              border: `1px solid ${node.color}33`,
                              padding: isMobile ? "4px 8px" : "6px 14px",
                              borderRadius: 2, fontSize: isMobile ? 10 : 12,
                              fontWeight: 500, whiteSpace: "nowrap", cursor: "help",
                              transition: "all 0.2s",
                            }}>{node.name}</span>
                          </Tooltip>,
                        ];
                        if (ni < flow.nodes.length - 1) {
                          items.push(
                            <span key={`a-${ni}`} style={{ color: "#2a2e4a", fontSize: isMobile ? 12 : 16 }}>→</span>
                          );
                        }
                        return items;
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ textAlign: "center", color: "#4a5578", fontSize: 9, marginTop: 8 }}>
                  ※ 各サービス名にホバーすると役割が表示されます
                </div>
              </PixelBorder>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === "skills" && (
            <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>✦ SKILLS <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 技術スキル</span></div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                {SKILLS.map((skill, i) => (
                  <div key={skill.name} onClick={() => setSelectedSkill(selectedSkill===i?null:i)} style={{
                    background: selectedSkill===i?"#1a1d30":"#0f1229",
                    border: `1px solid ${selectedSkill===i?skill.color+"66":"#1a1d30"}`,
                    borderRadius: 2, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s",
                    animation: "slideUp 0.4s ease both", animationDelay: `${i*80}ms`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{skill.element}</span>
                        <span style={{ color: "#e2e8ff", fontSize: 13, fontWeight: 600 }}>{skill.name}</span>
                      </div>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: skill.color }}>{skill.years}yr</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ color: "#6b7199", fontSize: 9, flexShrink: 0 }}>経験 {skill.years}年</span>
                    </div>
                    <GaugeBar current={skill.years} max={MAX_YEARS} color={skill.color} height={8} showText={false} />
                    <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                      {skill.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 9, color: skill.color, background: `${skill.color}11`, border: `1px solid ${skill.color}22`, padding: "1px 7px", borderRadius: 2 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PixelBorder>
          )}

          {/* CAREER (Quests + Timeline merged) */}
          {activeTab === "quests" && (
            <div>
              <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>⚑ CAREER <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 職歴</span></div>
                {QUESTS.map((quest, i) => (
                  <div key={i} style={{
                    background: "#0f1229", border: `1px solid ${quest.status==="active"?"#4a6cf744":"#1a1d30"}`,
                    borderRadius: 2, padding: isMobile?"12px 14px":"16px 18px", marginBottom: 12, position: "relative",
                    animation: "slideUp 0.4s ease both", animationDelay: `${i*150}ms`,
                  }}>
                    {quest.status==="active" && <div style={{ position: "absolute", top: 8, right: 10, background: "#22c55e22", color: "#22c55e", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 2, border: "1px solid #22c55e44", letterSpacing: 1 }}>ACTIVE</div>}
                    {quest.status==="complete" && <div style={{ position: "absolute", top: 8, right: 10, color: "#6b7199", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>COMPLETE ✓</div>}
                    <div style={{ color: "#e2e8ff", fontSize: isMobile?13:14, fontWeight: 600, marginBottom: 4, paddingRight: 70 }}>{quest.title}</div>
                    <div style={{ color: "#4a6cf7", fontSize: 12, marginBottom: 2 }}>{quest.guild}</div>
                    <div style={{ color: "#6b7199", fontSize: 10, marginBottom: 8 }}>{quest.period}</div>
                    <p style={{ color: "#8890b5", fontSize: 12, lineHeight: 1.8 }}>{quest.desc}</p>
                  </div>
                ))}
              </PixelBorder>

              {/* Activity timeline */}
              <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px" }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>
                  ⏳ ACTIVITY <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 活動・成果の記録</span>
                </div>
                <ComingSoon icon="⏳" message="活動記録を準備中..." />
              </PixelBorder>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === "inventory" && (
            <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>◈ CERTIFICATIONS <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 装備・資格</span></div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {INVENTORY.map((item, i) => {
                  const r = RARITY_COLORS[item.rarity];
                  return (
                    <div key={i} style={{
                      background: "#0f1229", border: `1px solid ${r.bg}33`, borderRadius: 2,
                      padding: "14px 16px", position: "relative", overflow: "hidden",
                      animation: "slideUp 0.4s ease both", animationDelay: `${i*120}ms`,
                    }}>
                      {item.rarity==="legendary" && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent 30%, ${r.bg}0a 50%, transparent 70%)`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />}
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
            <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px" }}>
              <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>📖 BLOG <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 冒険記録</span></div>
              <ComingSoon icon="📖" message="冒険記録を準備中..." />
            </PixelBorder>
          )}

          {/* TREASURY */}
          {activeTab === "treasury" && (
            <PixelBorder style={{ padding: isMobile?"16px 12px":"20px 24px" }}>
              <div style={{ color: "#eab308", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                💰 INFRA COST <span style={{ color: "#b4891888", fontWeight: 400, letterSpacing: 0 }}>— ギルド金庫</span>
              </div>
              <ComingSoon icon="💰" message="コストデータを準備中..." />
            </PixelBorder>
          )}

          {/* CONTACT */}
          {activeTab === "contact" && (
            <div>
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  ✉ CONTACT <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— ギルド受付</span>
                </div>
                <p style={{ color: "#8890b5", fontSize: 12, lineHeight: 1.9, marginBottom: 20 }}>
                  お仕事のご依頼・技術的なご相談・カジュアル面談のお誘いなど、お気軽にどうぞ。
                  <br />下記のいずれかからご連絡ください。
                </p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {CONTACTS.map((c, i) => (
                    <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" style={{
                      textDecoration: "none",
                      background: "#0f1229", border: `1px solid ${c.color}22`, borderRadius: 2,
                      padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
                      cursor: "pointer", transition: "all 0.2s",
                      animation: "slideUp 0.4s ease both", animationDelay: `${i * 80}ms`,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "66"; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = c.color + "22"; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 2,
                        background: `${c.color}11`, border: `1px solid ${c.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, color: c.color, fontWeight: 700, flexShrink: 0,
                      }}>
                        {c.icon}
                      </div>
                      <div>
                        <div style={{ color: "#e2e8ff", fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: "#6b7199", fontSize: 10, marginTop: 2 }}>{c.desc}</div>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#2a2e4a", fontSize: 16, flexShrink: 0 }}>→</span>
                    </a>
                  ))}
                </div>
              </PixelBorder>

              <PixelBorder style={{ padding: isMobile ? "14px 14px" : "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>💬</span>
                  <div>
                    <div style={{ color: "#e2e8ff", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>返信について</div>
                    <p style={{ color: "#6b7199", fontSize: 11, lineHeight: 1.8 }}>
                      通常 1〜2 営業日以内にご返信いたします。<br />
                      お急ぎの場合は Email にてご連絡ください。
                    </p>
                  </div>
                </div>
              </PixelBorder>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 10, borderTop: "2px solid #1a1d30",
        padding: "16px 24px", textAlign: "center", color: "#3a3f5c",
        fontSize: 10, letterSpacing: 1, background: "#080a14",
      }}>
        © 2025 {STATS.name} — Built with React + Vite on ECS Fargate
        <br /><span style={{ color: "#2a2e4a" }}>☁ Powered by AWS — GAME OVER? NEVER.</span>
      </div>
    </div>
  );
}
