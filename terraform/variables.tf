variable "project" {
  description = "Project name used as a prefix for all resources"
  type        = string
  default     = "my-blog"
}

variable "domain_name" {
  description = "Domain name for the blog"
  type        = string
  default     = "jishinzerogon.dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = map(string)
  default = {
    public_a = "10.0.1.0/24"
    public_c = "10.0.2.0/24"
  }
}

variable "ecs_cpu" {
  description = "CPU units for ECS task"
  type        = string
  default     = "256"
}

variable "ecs_memory" {
  description = "Memory (MiB) for ECS task"
  type        = string
  default     = "512"
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "github_repository" {
  description = "GitHub repository (owner/repo) allowed to assume the CI/CD role via OIDC"
  type        = string
  default     = "jishinzerogon/my-blog"
}

variable "enable_serving" {
  description = "Whether to create serving resources (ALB, ECS service, CloudFront). Set false during dev to suspend and save cost."
  type        = bool
  default     = true
}
