import { useState, useEffect } from "react";

/* ─── DATA ─── */
const STATS = {
  name: "自信なさげなどらごん",
  title: "Lv.6 Infrastructure Engineer",
  titleTooltip: "Lv = エンジニア歴（年数）",
  subtitle: "Corporate IT → Server-Side Engineer → Infrastructure Engineer",
  hp: { current: 999, max: 999, label: "HP", tooltip: "やる気 — モチベーション" },
  mp: { current: 7, max: 9, label: "MP", tooltip: "実務経験のある技術領域 — 7/9 領域" },
  exp: { current: 6, max: 10, label: "EXP", tooltip: "エンジニア歴 — 6年目" },
};

const MAX_YEARS = 6;

const SKILLS = [
  { name: "Linux", years: 6, element: "🐧", color: "#FCC624", tags: ["Amazon Linux 2 / 2023", "CentOS"] },
  { name: "AWS", years: 2, element: "☁", color: "#FF9900", tags: ["EC2", "VPC", "ELB", "RDS", "ElastiCache", "Lambda", "API Gateway", "SES", "SNS", "CloudWatch", "IAM", "S3", "Route53"] },
  { name: "RDBMS", years: 2, element: "🗄", color: "#00758F", tags: ["MySQL", "Amazon Aurora MySQL"] },
  { name: "Terraform", years: 2, element: "⬡", color: "#7B42BC", tags: ["State管理", "モジュール化", "リファクタリング"] },
  { name: "Ansible", years: 2, element: "⚙", color: "#EE0000", tags: ["Playbook", "role設計", "inventory", "リファクタリング"] },
  { name: "Monitoring", years: 2, element: "👁", color: "#E6522C", tags: ["Prometheus", "Grafana", "Alertmanager", "Zabbix"] },
  { name: "Python / Shell", years: 2, element: "🐍", color: "#3776AB", tags: ["Lambda", "インスタンス制御", "AMI削除", "証明書配布"] },
  { name: "Ruby on Rails", years: 1, element: "💎", color: "#CC342D", tags: ["ポータルサイト開発", "社内Webツール"] },
  { name: "Docker", years: 0.5, element: "🐋", color: "#2496ED", tags: ["学習中", "Dockerfile", "個人開発"] },
];

const QUESTS = [
  { period: "2024 - Present", title: "☆ インフラエンジニア", guild: "ゲーム会社 (自社開発・運営 / 現職)", desc: "AWS / オンプレミス環境のインフラ構築・運用、およびコスト最適化を担当。IaC による自動化を推進。", status: "active" },
  { period: "2023", title: "★ Web開発エンジニア", guild: "ゲーム会社 (運営)", desc: "ゲームポータルサイトの開発・運用・保守 (Rails / ASP.NET)。", note: "※ 前職の社内SEから関連会社へ転籍し、職種転換。", status: "complete" },
  { period: "2020 - 2022", title: "★ 社内SE", guild: "ゲーム会社 (運営)", desc: "社内 PC・サーバー・アカウントの管理と運用。オンプレミスサーバー構築・運用、および VMware 仮想環境の運用・仮想化プロジェクトのサポート経験を積む。", status: "complete" },
];

const INVENTORY = [
  { name: "AWS Solutions Architect Associate", rarity: "rare", icon: "☁", year: "2026" },
  { name: "基本情報技術者", rarity: "rare", icon: "📜", year: "2022" },
  { name: "ITパスポート", rarity: "uncommon", icon: "📜", year: "2020" },
];

const POSTS = [];

const RARITY_COLORS = {
  legendary: { bg: "#FF9900", text: "#1a0a00", glow: "#FF990066", label: "★★★★★" },
  epic: { bg: "#a855f7", text: "#1a001a", glow: "#a855f766", label: "★★★★☆" },
  rare: { bg: "#3b82f6", text: "#001a33", glow: "#3b82f666", label: "★★★☆☆" },
  uncommon: { bg: "#22c55e", text: "#001a0a", glow: "#22c55e66", label: "★★☆☆☆" },
};

const TIMELINE = [
  // ▼ 個人開発 (my-blog)
  { date: "2026-04-25", type: "personal", title: "ECS Fargate から S3 + CloudFront へ移行 (OAC)", desc: "用途に対してオーバースペックだった ECS Fargate 構成を、静的 SPA 配信に最適化した S3 + CloudFront (OAC) 構成に移行。固定費 ~$22/月 → ~$0.10/月。ECS リソース定義は count トグルで残置し、後のバックエンド追加で再利用予定。" },
  { date: "2026-04-25", type: "personal", title: "Zenn 1 本目公開 (ECS + Terraform 構築編)", desc: "ポートフォリオサイトを React + Vite + ECS Fargate + Terraform で構築した経緯を記事化し、Zenn で公開。" },
  { date: "2026-04-16", type: "personal", title: "React + Vite でポートフォリオページを実装", desc: "ゲーム UI 風のポートフォリオページを Vite で構築。Docker イメージに同梱して ECS Fargate で配信。" },
  { date: "2026-04-14", type: "personal", title: "GitHub Actions による ECS 自動デプロイ", desc: "OIDC で AWS 認証し、ECR push → ECS update-service --force-new-deployment → wait services-stable まで自動化。" },
  { date: "2026-04-04", type: "personal", title: "AWS インフラ構築 (VPC / ALB / ECS Fargate / CloudFront)", desc: "Terraform でゼロから AWS 環境を構築。CloudFront → ALB → ECS Fargate (nginx) の配信経路を開通。" },

  // ▼ 業務実績
  { date: "2026-04〜", type: "work", ongoing: true, title: "オンプレミスサーバーの AWS S3 バックアップ基盤構築", desc: "10 年以上稼働する既存オンプレサーバーのバックアップ先として、AWS S3 を新たに採用する移行プロジェクトを主担当で推進中。EC2 + rclone による転送基盤の設計・検討を進めている。" },
  { date: "2026-03", type: "work", title: "AWS SES の bounce / complaint 監視基盤を構築", desc: "メール送信時の bounce (配信失敗) / complaint (苦情) 情報を SES → SNS → Lambda で整形して CloudWatch Logs に集約し、閾値超過時は Google Chat へ通知するモジュールを実装。送信レピュテーション低下 (最悪の場合は SES 送信停止) の前兆を早期検知できる仕組み。その後、AWS で運営している SES 利用タイトル全てに横展開。" },
  // TODO: 削減額・EC2/RDS 台数などの具体数値を確認でき次第、desc に追記する
  { date: "2026-01", type: "work", title: "稼働中ゲーム 3 タイトル目のコスト削減 (最大規模)", desc: "前 2 タイトルからの連続で、3 件目のゲームタイトルでインフラ縮退・コスト最適化を実施。これまでで最大規模の環境に対して、確立した手法を踏襲しつつ適用範囲を拡大。" },
  { date: "2025-09", type: "work", title: "稼働中ゲーム 2 タイトルのコスト削減プロジェクト主導", desc: "インフラ主担当 (5 名体制) として、2 タイトル連続で月額 AWS コストを約 80% 削減。EC2 / RDS の統合、ELB・ElastiCache 撤去と EC2 ローカル Redis への切替、Let's Encrypt による SSL 証明書の自動更新・配布基盤を構築。運営・経営層との合意形成、開発チームとの折衝を主導。" },
  { date: "2025-07", type: "work", title: "オンプレミス環境の SSL 証明書更新を完全自動化", desc: "手動で購入・適用していた SSL 証明書運用を、ZeroSSL + acme.sh で完全自動化。各サーバへの配布スクリプトと、失敗時に Google Chat へ通知する監視まで実装し、人手を介さない運用体制を構築。古い端末のユーザーが多いタイトル特性を踏まえ、互換性を優先して Let's Encrypt ではなく ZeroSSL を選定。有料証明書からの切替でコストも削減。" },
  { date: "2024-12", type: "work", title: "新規スマホ向け RPG の AWS インフラ構築", desc: "インフラチーム 2 名のメイン担当 (全体 20 名体制) として、EC2 12 台規模の冗長化設計から Terraform + Ansible での IaC、Prometheus / Grafana / Alertmanager による監視基盤まで構築。Lambda + API Gateway でワンクリック起動/停止 URL を独自開発し、Aurora Serverless v2 と組み合わせて開発環境コストを最適化。" },
  { date: "2024-01", type: "work", title: "インフラエンジニアへキャリアチェンジ", desc: "既存ゲームタイトルのインフラ運用保守を担当しながら、未経験から Terraform / Ansible を習得。既存 IaC コードの読み解きとリファクタリングを通じて、後続の新規構築プロジェクトを主担当するための技術基盤を整えた。" },
  { date: "2023-01", type: "work", title: "Web 開発エンジニア", desc: "ゲームポータルサイトの開発・運用・保守 (Rails / ASP.NET)。10 タイトル以上のコピーライト・ドメイン・SSL 証明書の更新、オンプレ環境からクラウド環境への Web サーバ移行を実施。" },
  { date: "2020-05", type: "work", title: "社内 SE (キャリアスタート)", desc: "社内 PC の管理・キッティング、ヘルプデスク、オンプレミスサーバー・アカウント管理全般を担当。IT インフラの基礎とユーザーサポート業務を経験。" },
];

const TIMELINE_TYPES = {
  work: { color: "#4a6cf7", label: "業務" },
  personal: { color: "#22c55e", label: "個人" },
};

const INFRA_VERSIONS = [
  {
    version: "v1.0",
    date: "2026-04",
    title: "初期構成 — ECS Fargate でコンテナ配信",
    status: "past",
    flow: ["Cloudflare DNS", "CloudFront", "ALB", "ECS Fargate (nginx)"],
    why: "コンテナ運用 + Terraform IaC を題材として学習するために採用。",
    note: "ALB の固定費 (~$22/月) が遊休時に効くため、開発外は手動で destroy する運用でしのいでいた。",
  },
  {
    version: "v2.0",
    date: "2026-04-25",
    title: "S3 + CloudFront へ移行 — OAC で静的配信",
    status: "current",
    flow: ["Cloudflare DNS", "CloudFront", "S3 (OAC)"],
    why: "静的 SPA に最適化。OAC で S3 を private に保ったまま CloudFront 経由のみアクセス許可。",
    note: "固定費が実質ゼロに (CloudFront Always Free 枠で月 $0.10 以下)。Phase 2 で Rails API を /api/* に追加できるよう ECS リソース定義は残置。",
  },
  {
    version: "Phase 2",
    date: "予定",
    title: "Rails API 追加 — 動的エンドポイントを ECS で再活用",
    status: "planned",
    flow: ["CloudFront", "/api/* → ALB", "ECS (Rails)", "+ 既存 S3"],
    why: "アクセスカウンタ等の動的処理用に Rails API を追加。CloudFront に /api/* ビヘイビア追加で既存 ALB+ECS を再利用。",
  },
];

const CONTACTS = [
  { name: "Email", icon: "@", url: "mailto:ryouto0815@gmail.com", color: "#eab308", desc: "最も確実な連絡手段" },
  { name: "GitHub", icon: "◈", url: "https://github.com/jishinzerogon", color: "#c9d1d9", desc: "ソースコード & コントリビューション" },
  { name: "X (Twitter)", icon: "𝕏", url: "https://x.com/jishinzerogon", color: "#e2e8ff", desc: "@jishinzerogon" },
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
                  障害が起きてから復旧するより、障害を起こさない設計・運用を重視するスタンスです。
                  AWS / オンプレ環境の安定運用とコスト最適化を中心に取り組んできました。
                  最近は個人開発を題材にコンテナ技術と CI/CD を学習中。Terraform / Ansible による IaC は実務で活用しています。
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
                    { icon: "🛡", title: "安定運用ファースト", desc: "必要な可用性を見極め、障害を起こさない設計を優先する。", color: "#22c55e" },
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
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px", marginBottom: 16 }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  🗺 ARCHITECTURE <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— このサイトのインフラ構成</span>
                </div>

                {[
                  {
                    label: "🌐 ACCESS FLOW",
                    sub: "ユーザーのアクセス経路",
                    nodes: [
                      { name: "Cloudflare DNS", color: "#F38020", desc: "ドメイン購入元 & ネームサーバ" },
                      { name: "CloudFront", color: "#8c4fff", desc: "CDN・HTTPS終端・SPA フォールバック" },
                      { name: "S3 (OAC)", color: "#569A31", desc: "静的ファイル配信 (private、CloudFront からのみアクセス許可)" },
                    ],
                  },
                  {
                    label: "🚀 DEPLOY FLOW",
                    sub: "デプロイ経路",
                    nodes: [
                      { name: "GitHub", color: "#c9d1d9", desc: "ソースコード管理" },
                      { name: "GitHub Actions", color: "#2088FF", desc: "npm build & AWS OIDC 認証" },
                      { name: "S3", color: "#569A31", desc: "aws s3 sync で静的ファイルをアップロード" },
                      { name: "CloudFront", color: "#8c4fff", desc: "create-invalidation で CDN キャッシュ無効化" },
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

              {/* Infra History */}
              <PixelBorder style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
                  🕰 INFRA HISTORY <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— インフラ変遷</span>
                </div>

                {INFRA_VERSIONS.map((v, i) => {
                  const statusColor = v.status === "current" ? "#22c55e" : v.status === "planned" ? "#eab308" : "#6b7199";
                  const statusLabel = v.status === "current" ? "CURRENT" : v.status === "planned" ? "PLANNED" : "PAST";
                  return (
                    <div key={i} style={{
                      background: "#0f1229",
                      border: `1px solid ${statusColor}33`,
                      borderRadius: 2,
                      padding: isMobile ? "12px 14px" : "14px 18px",
                      marginBottom: i === INFRA_VERSIONS.length - 1 ? 0 : 12,
                      animation: "slideUp 0.4s ease both",
                      animationDelay: `${i * 100}ms`,
                      position: "relative",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{
                          color: statusColor, fontSize: 10, fontWeight: 700,
                          fontFamily: "'Press Start 2P', monospace", letterSpacing: 1,
                        }}>{v.version}</span>
                        <span style={{ color: "#6b7199", fontSize: 10 }}>{v.date}</span>
                        <span style={{
                          fontSize: 9, color: statusColor, background: `${statusColor}22`,
                          border: `1px solid ${statusColor}55`, padding: "1px 7px", borderRadius: 2, letterSpacing: 1, fontWeight: 700,
                        }}>{statusLabel}</span>
                      </div>
                      <div style={{ color: "#e2e8ff", fontSize: isMobile ? 12 : 13, fontWeight: 600, marginBottom: 8 }}>{v.title}</div>

                      <div style={{
                        display: "flex", alignItems: "center", flexWrap: "wrap",
                        gap: isMobile ? 4 : 6, margin: "8px 0 10px",
                        padding: "8px 10px", background: "#080a14", border: "1px solid #1a1d30", borderRadius: 2,
                      }}>
                        {v.flow.flatMap((node, ni) => {
                          const items = [
                            <span key={`n-${ni}`} style={{
                              color: "#8890b5", fontSize: isMobile ? 10 : 11,
                              whiteSpace: "nowrap",
                            }}>{node}</span>,
                          ];
                          if (ni < v.flow.length - 1) {
                            items.push(
                              <span key={`a-${ni}`} style={{ color: "#2a2e4a", fontSize: isMobile ? 10 : 12 }}>→</span>
                            );
                          }
                          return items;
                        })}
                      </div>

                      <p style={{ color: "#8890b5", fontSize: 11, lineHeight: 1.7 }}>
                        <span style={{ color: statusColor }}>▸ </span>{v.why}
                      </p>
                      {v.note && (
                        <p style={{ color: "#6b7199", fontSize: 10, lineHeight: 1.7, marginTop: 4 }}>{v.note}</p>
                      )}
                    </div>
                  );
                })}
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
                    {quest.note && (
                      <p style={{ color: "#6b7199", fontSize: 11, lineHeight: 1.8, marginTop: 6 }}>{quest.note}</p>
                    )}
                  </div>
                ))}
              </PixelBorder>

              {/* Activity timeline */}
              <PixelBorder style={{ padding: isMobile ? "16px 12px" : "20px 24px" }}>
                <div style={{ color: "#4a6cf7", fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>
                  ⏳ ACTIVITY <span style={{ color: "#4a5578", fontWeight: 400, letterSpacing: 0 }}>— 活動・成果の記録</span>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  {Object.entries(TIMELINE_TYPES).map(([key, t]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 6px ${t.color}66` }} />
                      <span style={{ color: "#6b7199", fontSize: 10 }}>{t.label}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div style={{ position: "relative", paddingLeft: isMobile ? 18 : 22 }}>
                  <div style={{
                    position: "absolute", left: isMobile ? 4 : 5, top: 6, bottom: 6,
                    width: 2, background: "#1a1d30",
                  }} />
                  {TIMELINE.map((event, i) => {
                    const t = TIMELINE_TYPES[event.type] || TIMELINE_TYPES.personal;
                    return (
                      <div key={i} style={{
                        position: "relative", marginBottom: i === TIMELINE.length - 1 ? 0 : 16,
                        animation: "slideUp 0.4s ease both", animationDelay: `${i * 50}ms`,
                      }}>
                        <div style={{
                          position: "absolute", left: isMobile ? -16 : -20, top: 5,
                          width: 10, height: 10, background: t.color,
                          border: "2px solid #0c0e1a", borderRadius: "50%",
                          boxShadow: `0 0 6px ${t.color}88`,
                        }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ color: "#6b7199", fontSize: 10, fontFamily: "'Press Start 2P', monospace" }}>{event.date}</span>
                          <span style={{
                            fontSize: 9, color: t.color, background: `${t.color}11`,
                            border: `1px solid ${t.color}44`, padding: "1px 7px", borderRadius: 2, letterSpacing: 1,
                          }}>{t.label}</span>
                          {event.ongoing && (
                            <span style={{
                              fontSize: 9, color: "#eab308", background: "#eab30822",
                              border: "1px solid #eab30866", padding: "1px 7px", borderRadius: 2, letterSpacing: 1,
                              animation: "goldGlow 2s ease infinite", fontWeight: 700,
                            }}>進行中</span>
                          )}
                        </div>
                        <div style={{ color: "#e2e8ff", fontSize: isMobile ? 12 : 13, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
                        <p style={{ color: "#8890b5", fontSize: 11, lineHeight: 1.7 }}>{event.desc}</p>
                      </div>
                    );
                  })}
                </div>
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
                  カジュアル面談のお誘い・採用に関するお問い合わせなど、お気軽にどうぞ。
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
        © 2026 {STATS.name} — Built with React + Vite on S3 + CloudFront
        <br /><span style={{ color: "#2a2e4a" }}>☁ Powered by AWS — GAME OVER? NEVER.</span>
      </div>
    </div>
  );
}
