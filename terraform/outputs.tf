output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (set this as Cloudflare CNAME target)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "alb_dns_name" {
  description = "ALB DNS name (CloudFront origin)"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker push"
  value       = aws_ecr_repository.my_blog.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
