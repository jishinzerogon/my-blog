# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`jishinzerogon.dev` で公開されている個人ポートフォリオサイトのインフラ一式。React + Vite でビルドした SPA を nginx コンテナで配信し、AWS 上で動かしている。構成管理は Terraform。コードの読みやすさ・ベストプラクティスへの準拠を重視する。

## アーキテクチャ

```
Cloudflare DNS (ドメイン購入元 & ネームサーバ) → CloudFront → ALB → ECS(Fargate, nginx) ← ECR
                                                                      ACM (us-east-1 for CloudFront, ap-northeast-1 for ALB)
```

- **DNS**: `jishinzerogon.dev` は Cloudflare で購入し、ネームサーバも Cloudflare のまま (Route53 は使わない)。Route53 への移管は Cloudflare の有料プラン要件により見送り済み。Terraform に DNS リソースは含めない。

- **フロントエンド**: React 19 + Vite の SPA (`index.html`, `src/App.jsx`, `src/main.jsx`)。ゲーム UI 風のポートフォリオページ。`package.json` の `build` スクリプトで `dist/` を生成する。
- **コンテナ**: `Dockerfile` はマルチステージビルド構成。ステージ 1 の `node:22-alpine` で `npm run build` を実行し、ステージ 2 の `nginx:alpine` に `dist/` と `nginx.conf` をコピーして配信する。
- **Terraform** (`terraform/`): ファイルはリソース種別ごとに分割 (`vpc.tf`, `alb.tf`, `ecs.tf`, `cloudfront.tf`, `acm.tf`, `ecr.tf`, `iam.tf`, `cloudwatch.tf`, `security_group.tf`)。
  - バックエンドは S3 (`my-blog-tfstate-203369940478-ap-northeast-1-an`)。
  - プロバイダは ap-northeast-1 がデフォルト、CloudFront 用 ACM 証明書のために us-east-1 エイリアス (`aws.us_east_1`) を定義。
  - 変数は `variables.tf` に集約 (project 名、ドメイン、リージョン、VPC/サブネット CIDR、ECS のCPU/メモリ/desired_count)。リソース名は `${var.project}-*` で統一。
- **セキュリティグループ**: ALB 用と ECS 用で分離済み。ALB は CloudFront マネージドプレフィックスリストからのみ受信、ECS は ALB SG からのみ受信する設計。新規ルールを追加する際はこの境界を維持する。
- **ログ**: ECS コンテナログは CloudWatch Logs `/ecs/${var.project}` に awslogs ドライバで送信 (`cloudwatch.tf` でロググループ定義)。
- **CloudFront**: オリジンは ALB の DNS 名 (http-only)。キャッシュは Managed-CachingOptimized ポリシーを使用 (deprecated な `forwarded_values` は使わない)。

## よく使うコマンド

Terraform 操作は `terraform/` ディレクトリで実行:

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform fmt       # フォーマット
terraform validate  # 構文チェック
```

Docker イメージのローカルビルド (CI と同じ):

```bash
docker build -t my-blog .
docker run --rm -p 8080:80 my-blog  # http://localhost:8080 で確認
```

フロントエンドのローカル開発:

```bash
npm install
npm run dev      # Vite 開発サーバ起動
npm run build    # dist/ を生成
```

GitHub Actions ワークフロー (`.github/workflows/`):

- `ci.yml` — PR 時に Docker build を検証 (アプリ側の build チェック)
- `terraform-ci.yml` — `terraform/**` を変更した PR で fmt / validate / plan を実行 (OIDC で AWS 認証)
- `deploy.yml` — `main` への push で ECR に image push → ECS `update-service --force-new-deployment` → `wait services-stable` でデプロイ完了待機 (OIDC で AWS 認証)

## 編集時の注意

- `terraform.tfstate` / `*.tfstate.backup` / `*.un~` は `.gitignore` 済み。state ファイルをコミットしないこと。
- ハードコード値を新規に書き足す前に、既存変数で代替できないか確認し、なければ `variables.tf` に追加する方針。
- リソース命名は `${var.project}-*` を踏襲する。
- 非推奨 API (例: CloudFront の `forwarded_values`) は使わず、マネージドポリシー等の現行構文を使う。
