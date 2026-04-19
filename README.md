# my-blog

個人ブログ [jishinzerogon.dev](https://jishinzerogon.dev) のインフラ一式。静的な nginx コンテナを AWS 上で動かし、Terraform で構成管理している。

## アーキテクチャ

### アクセス経路 (ユーザーがサイトに到達するまで)

```
              ┌──────────────────┐
   ユーザ ──▶ │  Cloudflare DNS  │  ドメイン購入元 & ネームサーバ
              └─────┬────────────┘
                    │
              ┌─────▼──────┐
              │ CloudFront │ ◀── ACM (us-east-1)
              └─────┬──────┘
                    │ HTTP (CloudFront managed prefix list のみ許可)
              ┌─────▼──────┐
              │    ALB     │ ◀── ACM (ap-northeast-1)
              └─────┬──────┘
                    │
              ┌─────▼──────────────────┐
              │  ECS Service (Fargate) │ ──▶ CloudWatch Logs
              │   nginx:alpine         │
              └────────────────────────┘
```

### デプロイ経路 (コミットから本番反映まで)

```
              ┌────────────┐
              │   GitHub   │  main push
              └─────┬──────┘
                    │ OIDC (鍵レス)
              ┌─────▼──────────┐
              │ GitHub Actions │  build & deploy
              └─────┬──────────┘
                    │ docker push
              ┌─────▼──────┐
              │    ECR     │
              └─────┬──────┘
                    │ image pull (update-service --force-new-deployment)
              ┌─────▼──────────────────┐
              │  ECS Service (Fargate) │
              └────────────────────────┘
```

> ℹ️ ドメイン `jishinzerogon.dev` は Cloudflare で購入しており、ネームサーバも Cloudflare のまま利用している。Route 53 への移管も検討したが、Cloudflare 側で有料プランが必要となるため見送り、DNS は Cloudflare、CDN 以降は AWS という構成を採用している。

## 使用技術

### DNS (AWS 外)
- **Cloudflare DNS** — ドメイン `jishinzerogon.dev` の購入元 & ネームサーバ。CloudFront ディストリビューションへ CNAME で向けている

### AWS
- **CloudFront** — CDN・HTTPS 終端
- **ACM** — TLS 証明書 (CloudFront 用は us-east-1、ALB 用は ap-northeast-1 の 2 リージョンで管理)
- **ALB** — L7 ロードバランサ
- **ECS on Fargate** — コンテナ実行基盤
- **ECR** — コンテナレジストリ
- **VPC / Subnet / Security Group** — ネットワーク
- **CloudWatch Logs** — コンテナログ
- **IAM (OIDC)** — GitHub Actions からの鍵レスデプロイ
- **S3** — Terraform state 管理

### ツール
- **Terraform** — IaC (リソース種別ごとにファイル分割、変数は `variables.tf` に集約)
- **Docker** — マルチステージビルド (Node でビルド → `nginx:alpine` で配信)
- **React + Vite** — ポートフォリオ SPA のフロントエンド
- **GitHub Actions** — CI / CD

## 設計のポイント

### セキュリティ
- **SG の多層分離**: ALB 用 SG と ECS 用 SG を分離。ALB は CloudFront のマネージドプレフィックスリストからのみ受信し、ECS は ALB SG からのみ受信する構成で、ECS に対する直接アクセスを遮断
- **OIDC による鍵レスデプロイ**: GitHub Actions は IAM ユーザ・アクセスキーを一切使わず、OIDC で一時クレデンシャルを取得。trust policy の `sub` 条件で `main` ブランチ以外を弾く
- **最小権限の IAM ポリシー**: GitHub Actions 用 Role は ECR push と ECS UpdateService に限定、リソース ARN も個別指定

### CI / CD
- **CI と CD の責務分離**: PR では build 検証のみ (`ci.yml`)、`main` push で本番デプロイ (`deploy.yml`)
- **ローリングデプロイ**: `ecs update-service --force-new-deployment` と `aws ecs wait services-stable` でダウンタイムなしの無停止デプロイと完了待機を実現
- **コミット SHA でのタグ付け**: ECR push 時に `latest` と `${{ github.sha }}` の両タグを付与し、どのコミットがデプロイされたか追跡可能に

### IaC
- **ハードコード値の排除**: プロジェクト名、ドメイン、CIDR、ECS リソースサイズなどは `variables.tf` に集約
- **命名規則の統一**: 全リソース名を `${var.project}-*` で統一
- **現行構文への準拠**: 非推奨 API (例: CloudFront の `forwarded_values`) は使わず、`Managed-CachingOptimized` などのマネージドポリシーを利用
- **State の S3 バックエンド管理**: ローカルに state を置かず、S3 をリモートバックエンドとして使用

## ローカル開発

### フロントエンド (React + Vite)

```bash
npm install
npm run dev        # 開発サーバ起動 (HMR)
npm run build      # dist/ に本番ビルド
npm run preview    # ビルド成果物をローカルプレビュー
```

### コンテナのビルド・動作確認

```bash
docker build -t my-blog .
docker run --rm -p 8080:80 my-blog
# http://localhost:8080 にアクセスして確認
```

### Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform fmt       # フォーマット
terraform validate  # 構文チェック
```

## ディレクトリ構成

```
.
├── Dockerfile              # マルチステージ (Node でビルド → nginx:alpine で配信)
├── nginx.conf              # nginx サーバ設定
├── index.html              # Vite エントリ HTML
├── vite.config.js
├── package.json            # React 19 + Vite
├── src/                    # ポートフォリオ SPA のソース
│   ├── main.jsx
│   └── App.jsx
├── terraform/              # AWS インフラ定義 (リソース種別ごとにファイル分割)
│   ├── main.tf             # provider, backend
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf
│   ├── security_group.tf
│   ├── alb.tf
│   ├── ecs.tf
│   ├── ecr.tf
│   ├── cloudfront.tf
│   ├── acm.tf
│   ├── iam.tf              # ECS 実行ロール、GitHub Actions OIDC ロール
│   └── cloudwatch.tf
└── .github/workflows/
    ├── ci.yml              # PR 時: Docker build 検証
    ├── terraform-ci.yml    # terraform/** 変更 PR: fmt / validate / plan
    └── deploy.yml          # main push 時: build → ECR push → ECS デプロイ
```
