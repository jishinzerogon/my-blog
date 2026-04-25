output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (set this as Cloudflare CNAME target)."
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used by deploy.yml for cache invalidation)."
  value       = aws_cloudfront_distribution.main.id
}

output "frontend_bucket_name" {
  description = "S3 bucket name for the frontend (used by deploy.yml for s3 sync)."
  value       = aws_s3_bucket.frontend.id
}

output "alb_dns_name" {
  description = "ALB DNS name. null when enable_serving=false (Phase 2 で再利用予定)."
  value       = try(aws_lb.main[0].dns_name, null)
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker push"
  value       = aws_ecr_repository.my_blog.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
