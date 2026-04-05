resource "aws_acm_certificate" "main" {
  provider          = aws.us_east_1
  domain_name       = "jishinzerogon.dev"
  validation_method = "DNS"

  tags = {
    Name = "my-blog-acm"
  }

  lifecycle {
    create_before_destroy = true
  }
}
