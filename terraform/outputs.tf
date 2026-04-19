output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (set this as Cloudflare CNAME target). null when enable_serving=false."
  value       = try(aws_cloudfront_distribution.main[0].domain_name, null)
}

output "alb_dns_name" {
  description = "ALB DNS name (CloudFront origin). null when enable_serving=false."
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
