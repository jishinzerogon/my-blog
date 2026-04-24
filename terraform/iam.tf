resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# GitHub Actions OIDC provider — AWSに「GitHubの発行するトークンを信頼する」と登録
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aec5",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]

  tags = {
    Name = "${var.project}-github-oidc"
  }
}

# main への push でのみ引き受けられるデプロイ用 Role (write 権限)
resource "aws_iam_role" "github_actions_deploy" {
  name = "${var.project}-github-actions-deploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:ref:refs/heads/main"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}-github-actions-deploy-role"
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "${var.project}-github-actions-deploy-policy"
  role = aws_iam_role.github_actions_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EcrAuth"
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Sid    = "EcrPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
        ]
        Resource = aws_ecr_repository.my_blog.arn
      },
      {
        Sid    = "EcsDeploy"
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
        ]
        Resource = "arn:aws:ecs:${var.region}:*:service/${var.project}-cluster/${var.project}-service"
      },
    ]
  })
}

# PR でのみ引き受けられる terraform plan 用 Role (read-only)
resource "aws_iam_role" "github_actions_plan" {
  name = "${var.project}-github-actions-plan-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:pull_request"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}-github-actions-plan-role"
  }
}

resource "aws_iam_role_policy" "github_actions_plan" {
  name = "${var.project}-github-actions-plan-policy"
  role = aws_iam_role.github_actions_plan.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TfStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Resource = [
          "arn:aws:s3:::${var.project}-tfstate-*",
          "arn:aws:s3:::${var.project}-tfstate-*/*",
        ]
      },
      {
        Sid    = "TfPlanRead"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "ec2:GetManagedPrefixListEntries",
          "ecs:Describe*",
          "ecs:List*",
          "elasticloadbalancing:Describe*",
          "ecr:Describe*",
          "ecr:GetRepositoryPolicy",
          "ecr:GetLifecyclePolicy",
          "ecr:ListTagsForResource",
          "cloudfront:GetDistribution",
          "cloudfront:ListTagsForResource",
          "cloudfront:GetCachePolicy",
          "cloudfront:ListCachePolicies",
          "acm:DescribeCertificate",
          "acm:ListTagsForCertificate",
          "logs:DescribeLogGroups",
          "logs:ListTagsForResource",
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:GetOpenIDConnectProvider",
        ]
        Resource = "*"
      },
    ]
  })
}
