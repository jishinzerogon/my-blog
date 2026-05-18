# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`jishinzerogon.dev` で公開されている個人ポートフォリオサイトのインフラ一式。React + Vite でビルドした SPA を S3 + CloudFront で配信し、AWS 上で動かしている。構成管理は Terraform。コードの読みやすさ・ベストプラクティスへの準拠を重視する。

## アーキテクチャ

```
Cloudflare DNS → CloudFront (OAC) → S3 (静的ホスティング)
                        ↑
                 ACM (us-east-1)
```

- **DNS**: `jishinzerogon.dev` は Cloudflare で購入し、ネームサーバも Cloudflare のまま (Route53 は使わない)。Terraform に DNS リソースは含めない。
- **S3**: バケット名は `jishinzerogon-dev-frontend`。パブリックアクセスはすべてブロックし、CloudFront OAC 経由でのみ読み取りを許可。
- **CloudFront**: オリジンは S3 (OAC 署名)。SPA ルーティングのため 403/404 を `index.html` にフォールバック (TTL 60s)。キャッシュは Managed-CachingOptimized ポリシー。
- **フロントエンド**: React 19 + Vite の SPA。`src/App.jsx` が単一ファイルにコンポーネント・データ定数を集約。コンテンツ更新もこのファイルを直接編集する。
- **Terraform** (`terraform/`): ファイルはリソース種別ごとに分割。バックエンドは S3 (`my-blog-tfstate-203369940478-ap-northeast-1-an`)。プロバイダは ap-northeast-1 がデフォルト、CloudFront 用 ACM 証明書のために us-east-1 エイリアス (`aws.us_east_1`) を定義。

### 停止中のリソース (enable_serving フラグ)

ALB・ECS Fargate・ECR の構成が Terraform に残っているが、`var.enable_serving = false` でコスト抑制のため停止中。`alb.tf` の ALB/Listener と `ecs.tf` の ECS Service が `count = var.enable_serving ? 1 : 0` でゲートされている。`Dockerfile` と `nginx.conf` は CI での Docker build 検証に引き続き使用する。

## よく使うコマンド

フロントエンドのローカル開発:

```bash
npm install
npm run dev      # Vite 開発サーバ起動
npm run build    # dist/ を生成
```

Docker イメージのローカルビルド (CI と同じ):

```bash
docker build -t my-blog .
docker run --rm -p 8080:80 my-blog  # http://localhost:8080 で確認
```

Terraform 操作は `terraform/` ディレクトリで実行:

```bash
cd terraform
terraform init
terraform plan
terraform apply
terraform fmt       # フォーマット
terraform validate  # 構文チェック
```

## GitHub Actions ワークフロー

- `ci.yml` — PR 時に Docker build を検証
- `terraform-ci.yml` — `terraform/**` 変更の PR で fmt / validate / plan を実行 (OIDC 認証)
- `deploy.yml` — `main` への push で `npm run build` → S3 sync (`--delete`) → CloudFront キャッシュ無効化 (OIDC 認証)

## 編集時の注意

- `terraform.tfstate` / `*.tfstate.backup` は `.gitignore` 済み。state ファイルをコミットしないこと。
- ハードコード値を新規に書き足す前に `variables.tf` の既存変数で代替できないか確認する。新規変数が必要なら `variables.tf` に追加する。
- リソース命名は `${var.project}-*` を踏襲する。
- 非推奨 API (例: CloudFront の `forwarded_values`) は使わず、マネージドポリシー等の現行構文を使う。
- セキュリティグループ: ALB 用と ECS 用で分離済み (`security_group.tf`)。`enable_serving` が true に戻る場合、この境界 (ALB は CloudFront プレフィックスリストのみ受信、ECS は ALB SG のみ受信) を維持する。
