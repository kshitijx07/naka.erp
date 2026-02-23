@Library('jenkins-shared-library@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timestamps()
    }

    tools {
        nodejs 'node20'
    }

    environment {
        DOCKER_USER = 'kshitij2511'
        DEPLOY_HOST = '13.48.130.59'
        COMPOSE_DIR = '/home/ec2-user/naka'
        GIT_REPO = 'github.com/kshitijx07/naka.erp.git'
        BRANCH = 'main'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def msg = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    env.IS_SKIP_CI = msg.contains('[skip ci]')
                    echo "IS_SKIP_CI: ${env.IS_SKIP_CI}"
                }
            }
        }

        stage('Increment Semantic Version') {
            when {
                expression { env.IS_SKIP_CI == 'false' }
            }
            steps {
                script {
                    sh '''
                        cd backend
                        npm version patch --no-git-tag-version
                        cd ..
                        
                        cd frontend
                        npm version patch --no-git-tag-version
                        cd ..
                    '''

                    def version = sh(
                        script: "node -p \"require('./backend/package.json').version\"",
                        returnStdout: true
                    ).trim()

                    env.IMAGE_VERSION = version
                    echo "Unified Project Version: ${env.IMAGE_VERSION}"
                }
            }
        }

        stage('Commit Version Bump') {
            when {
                expression { env.IS_SKIP_CI == 'false' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token', 
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git config user.email "jenkins@naka.com"
                        git config user.name "jenkins"

                        git add backend/package.json frontend/package.json
                        git commit -m "chore: bump version [skip ci]" || echo "No changes"

                        git push https://${GIT_USER}:${GIT_TOKEN}@${GIT_REPO} HEAD:${BRANCH}
                    '''
                }
            }
        }

        stage('Docker Login') {
            when {
                expression { env.IS_SKIP_CI == 'false' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_LOGIN',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_LOGIN" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push Images') {
            when {
                expression { env.IS_SKIP_CI == 'false' }
            }
            steps {
                sh """
                    docker build -t ${DOCKER_USER}/naka-backend:${IMAGE_VERSION} ./backend
                    docker build -t ${DOCKER_USER}/naka-frontend:${IMAGE_VERSION} ./frontend

                    docker tag ${DOCKER_USER}/naka-backend:${IMAGE_VERSION} ${DOCKER_USER}/naka-backend:latest
                    docker tag ${DOCKER_USER}/naka-frontend:${IMAGE_VERSION} ${DOCKER_USER}/naka-frontend:latest

                    docker push ${DOCKER_USER}/naka-backend:${IMAGE_VERSION}
                    docker push ${DOCKER_USER}/naka-frontend:${IMAGE_VERSION}

                    docker push ${DOCKER_USER}/naka-backend:latest
                    docker push ${DOCKER_USER}/naka-frontend:latest
                """
            }
        }

        stage('Deploy to EC2') {
            when {
                expression { env.IS_SKIP_CI == 'false' }
            }
            steps {
                withCredentials([string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')]) {
                    sshagent(['ec2-server-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ec2-user@${DEPLOY_HOST} '
                                mkdir -p ${COMPOSE_DIR}
                            '

                            scp -o StrictHostKeyChecking=no docker-compose.yml \
                                ec2-user@${DEPLOY_HOST}:${COMPOSE_DIR}/docker-compose.yml

                            ssh -o StrictHostKeyChecking=no ec2-user@${DEPLOY_HOST} '
                                cd ${COMPOSE_DIR}

                                export IMAGE_VERSION="${IMAGE_VERSION}"
                                export JWT_SECRET="${JWT_SECRET}"
                                export JWT_REFRESH_SECRET="${JWT_SECRET}" 

                                docker compose down --remove-orphans
                                docker compose pull
                                docker compose up -d

                                docker image prune -f
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD completed successfully"
            echo "🚀 Deployed version: ${env.IMAGE_VERSION}"
        }
        failure {
            echo "❌ CI/CD failed"
        }
        always {
            cleanWs()
        }
    }
}