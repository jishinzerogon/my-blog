resource "aws_ecs_cluster" "main" {
  name = "${var.project}-cluster"

  tags = {
    Name = "${var.project}-cluster"
  }
}

resource "aws_ecs_task_definition" "main" {
  family                   = var.project
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
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
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project}"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "nginx"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project}-task"
  }
}

resource "aws_ecs_service" "main" {
  name            = "${var.project}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_c.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "nginx"
    container_port   = 80
  }

  tags = {
    Name = "${var.project}-service"
  }
}
