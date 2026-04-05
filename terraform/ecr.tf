resource "aws_ecr_repository" "my_blog" {
  name                 = "my-blog"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "my-blog"
  }
}
