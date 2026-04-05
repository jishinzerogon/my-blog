resource "aws_ecs_cluster" "main" {
  name = "my-blog-cluster"

  tags = {
    Name = "my-blog-cluster"
  }
}

resource "aws_ecs_task_definition" "main" {
  family                   = "my-blog"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "nginx"
      image     = "${aws_ecr_repository.my_blog.repository_url}:latest"
      essential = true
      portMappings = [
        { containerPort = 80
          protocol      = "tcp"
        }
      ]
    }
  ])

  tags = {
    Name = "my-blog-task"
  }
}

resource "aws_ecs_service" "main" {
  name            = "my-blog-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 0
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_c.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  tags = {
    Name = "my-blog-service"
  }
}

