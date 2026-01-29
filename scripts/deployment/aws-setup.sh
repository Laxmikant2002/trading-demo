#!/bin/bash

# XPro Trading Platform - AWS Deployment Setup
# This script helps set up AWS infrastructure for production deployment

set -e

echo "☁️  XPro Trading Platform - AWS Deployment Setup"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="xpro-trading"
REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check AWS CLI
check_aws_cli() {
    print_status "Checking AWS CLI..."

    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi

    print_success "AWS CLI is configured"
}

# Create S3 bucket for Terraform state
create_s3_bucket() {
    print_status "Creating S3 bucket for Terraform state..."

    BUCKET_NAME="${STACK_NAME}-terraform-state-${REGION}"

    if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        aws s3 mb "s3://${BUCKET_NAME}" --region $REGION

        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket $BUCKET_NAME \
            --versioning-configuration Status=Enabled

        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket $BUCKET_NAME \
            --server-side-encryption-configuration '{
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }
                ]
            }'

        print_success "S3 bucket created: $BUCKET_NAME"
    else
        print_warning "S3 bucket already exists: $BUCKET_NAME"
    fi
}

# Create DynamoDB table for Terraform locks
create_dynamodb_table() {
    print_status "Creating DynamoDB table for Terraform locks..."

    TABLE_NAME="${STACK_NAME}-terraform-locks"

    if ! aws dynamodb describe-table --table-name $TABLE_NAME &> /dev/null; then
        aws dynamodb create-table \
            --table-name $TABLE_NAME \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST

        print_success "DynamoDB table created: $TABLE_NAME"
    else
        print_warning "DynamoDB table already exists: $TABLE_NAME"
    fi
}

# Create ECR repositories
create_ecr_repositories() {
    print_status "Creating ECR repositories..."

    # API repository
    if ! aws ecr describe-repositories --repository-names ${STACK_NAME}-api &> /dev/null; then
        aws ecr create-repository \
            --repository-name ${STACK_NAME}-api \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256

        print_success "ECR repository created: ${STACK_NAME}-api"
    else
        print_warning "ECR repository already exists: ${STACK_NAME}-api"
    fi

    # Trading engine repository
    if ! aws ecr describe-repositories --repository-names ${STACK_NAME}-trading-engine &> /dev/null; then
        aws ecr create-repository \
            --repository-name ${STACK_NAME}-trading-engine \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256

        print_success "ECR repository created: ${STACK_NAME}-trading-engine"
    else
        print_warning "ECR repository already exists: ${STACK_NAME}-trading-engine"
    fi
}

# Create VPC and networking
create_vpc() {
    print_status "Creating VPC and networking..."

    # This is a simplified version. In production, you'd want to use Terraform or CloudFormation
    # for proper infrastructure as code.

    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block 10.0.0.0/16 \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${STACK_NAME}-vpc},{Key=Environment,Value=${ENVIRONMENT}}]" \
        --query 'Vpc.VpcId' \
        --output text)

    print_success "VPC created: $VPC_ID"

    # Create subnets
    SUBNET_PUBLIC_1=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.1.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${STACK_NAME}-public-1}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PUBLIC_2=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.2.0/24 \
        --availability-zone ${REGION}b \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${STACK_NAME}-public-2}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PRIVATE_1=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.3.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${STACK_NAME}-private-1}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_PRIVATE_2=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.4.0/24 \
        --availability-zone ${REGION}b \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${STACK_NAME}-private-2}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    print_success "Subnets created"

    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${STACK_NAME}-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)

    aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

    # Create NAT Gateway (simplified - using first public subnet)
    EIP_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)

    NAT_GW_ID=$(aws ec2 create-nat-gateway \
        --subnet-id $SUBNET_PUBLIC_1 \
        --allocation-id $EIP_ID \
        --query 'NatGateway.NatGatewayId' \
        --output text)

    print_success "NAT Gateway created"

    # Create route tables
    RTB_PUBLIC=$(aws ec2 create-route-table \
        --vpc-id $VPC_ID \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${STACK_NAME}-public-rtb}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)

    RTB_PRIVATE=$(aws ec2 create-route-table \
        --vpc-id $VPC_ID \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${STACK_NAME}-private-rtb}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)

    # Add routes
    aws ec2 create-route --route-table-id $RTB_PUBLIC --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
    aws ec2 create-route --route-table-id $RTB_PRIVATE --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW_ID

    # Associate route tables with subnets
    aws ec2 associate-route-table --subnet-id $SUBNET_PUBLIC_1 --route-table-id $RTB_PUBLIC
    aws ec2 associate-route-table --subnet-id $SUBNET_PUBLIC_2 --route-table-id $RTB_PUBLIC
    aws ec2 associate-route-table --subnet-id $SUBNET_PRIVATE_1 --route-table-id $RTB_PRIVATE
    aws ec2 associate-route-table --subnet-id $SUBNET_PRIVATE_2 --route-table-id $RTB_PRIVATE

    print_success "Networking setup completed"
}

# Create RDS PostgreSQL database
create_rds_database() {
    print_status "Creating RDS PostgreSQL database..."

    DB_IDENTIFIER="${STACK_NAME}-db"
    DB_NAME="xpro_trading"
    DB_USERNAME="xpro_admin"

    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 16)

    aws rds create-db-instance \
        --db-instance-identifier $DB_IDENTIFIER \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.4 \
        --master-username $DB_USERNAME \
        --master-user-password $DB_PASSWORD \
        --allocated-storage 20 \
        --db-name $DB_NAME \
        --vpc-security-group-ids $SECURITY_GROUP \
        --db-subnet-group-name $DB_SUBNET_GROUP \
        --backup-retention-period 7 \
        --multi-az \
        --storage-encrypted \
        --enable-performance-insights \
        --tags Key=Name,Value=${STACK_NAME}-db Key=Environment,Value=$ENVIRONMENT

    print_success "RDS database created"
    print_warning "Database password: $DB_PASSWORD (save this securely!)"
}

# Create ElastiCache Redis cluster
create_redis_cluster() {
    print_status "Creating ElastiCache Redis cluster..."

    CLUSTER_ID="${STACK_NAME}-redis"

    aws elasticache create-cache-cluster \
        --cache-cluster-id $CLUSTER_ID \
        --cache-node-type cache.t3.micro \
        --engine redis \
        --engine-version 7.0 \
        --num-cache-nodes 1 \
        --cache-subnet-group-name $REDIS_SUBNET_GROUP \
        --security-group-ids $SECURITY_GROUP \
        --tags Key=Name,Value=${STACK_NAME}-redis Key=Environment,Value=$ENVIRONMENT

    print_success "ElastiCache Redis cluster created"
}

# Create ECS cluster
create_ecs_cluster() {
    print_status "Creating ECS cluster..."

    aws ecs create-cluster \
        --cluster-name ${STACK_NAME}-cluster \
        --tags key=Name,value=${STACK_NAME}-cluster key=Environment,value=$ENVIRONMENT

    print_success "ECS cluster created"
}

# Generate Terraform configuration
generate_terraform_config() {
    print_status "Generating Terraform configuration..."

    mkdir -p infrastructure/terraform

    # Create main.tf
    cat > infrastructure/terraform/main.tf << EOF
terraform {
  backend "s3" {
    bucket         = "${STACK_NAME}-terraform-state-${REGION}"
    key            = "terraform.tfstate"
    region         = "${REGION}"
    dynamodb_table = "${STACK_NAME}-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${REGION}"
}

# VPC and networking resources would go here
# ECS cluster, services, and task definitions would go here
# RDS and ElastiCache resources would go here
# Load balancer and security groups would go here

EOF

    # Create variables.tf
    cat > infrastructure/terraform/variables.tf << EOF
variable "region" {
  description = "AWS region"
  type        = string
  default     = "${REGION}"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "${ENVIRONMENT}"
}

variable "stack_name" {
  description = "Stack name"
  type        = string
  default     = "${STACK_NAME}"
}

EOF

    print_success "Terraform configuration generated in infrastructure/terraform/"
}

# Display setup information
show_info() {
    echo ""
    echo "🎉 AWS infrastructure setup completed!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Review and customize the generated Terraform configuration"
    echo "2. Run 'terraform init' and 'terraform plan' in infrastructure/terraform/"
    echo "3. Set up your domain and SSL certificates"
    echo "4. Configure environment variables and secrets"
    echo "5. Deploy using the CI/CD pipeline"
    echo ""
    echo "Useful AWS services configured:"
    echo "• S3 bucket for Terraform state"
    echo "• DynamoDB table for Terraform locks"
    echo "• ECR repositories for container images"
    echo "• VPC with public/private subnets"
    echo "• NAT Gateway for private subnet internet access"
    echo "• RDS PostgreSQL database"
    echo "• ElastiCache Redis cluster"
    echo "• ECS cluster for container orchestration"
    echo ""
}

# Main execution
main() {
    check_aws_cli

    create_s3_bucket
    create_dynamodb_table
    create_ecr_repositories
    create_vpc
    create_rds_database
    create_redis_cluster
    create_ecs_cluster
    generate_terraform_config

    show_info
}

# Run main function
main "$@"