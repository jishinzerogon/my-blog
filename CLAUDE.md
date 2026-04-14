# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

`jishinzerogon.dev` で公開されている個人ブログのインフラ一式。静的な nginx コンテナを AWS 上で動かし、Terraform で構成管理している。コードの読みやすさ・ベストプラクティスへの準拠を重視する。

## アーキテクチャ

```
Route53 → CloudFront → ALB → ECS(Fargate, nginx) ← ECR
                                           ACM (us-east-1 for CloudFront, ap-northeast-1 for ALB)
```

- **コンテナ**: `Dockerfile` は `nginx:alpine` に `html/index.html` と `nginx.conf` をコピーするだけのシンプル構成。
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

CI (`.github/workflows/ci.yml`) は main への push で Docker build のみ実行 (push やデプロイは未設定)。

## 編集時の注意

- `terraform.tfstate` / `*.tfstate.backup` / `*.un~` は `.gitignore` 済み。state ファイルをコミットしないこと。
- ハードコード値を新規に書き足す前に、既存変数で代替できないか確認し、なければ `variables.tf` に追加する方針。
- リソース命名は `${var.project}-*` を踏襲する。
- 非推奨 API (例: CloudFront の `forwarded_values`) は使わず、マネージドポリシー等の現行構文を使う。
