resource "aws_acm_certificate" "main" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = {
    Name = "${var.project}-acm"
  }

  lifecycle {
    create_before_destroy = true
  }
}
