resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project}"
  retention_in_days = 14

  tags = {
    Name = "${var.project}-ecs-log-group"
  }
}
