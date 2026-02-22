@Library('jenkins-shared-library@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timestamps()
    }

    tools {
        nodejs 'node18'
    }

    environment {
        DOCKER_NAMESPACE = 'kshitij2511'
        DEPLOY_HOST = '51.21.1.228'
        COMPOSE_DIR = '/home/ec2-user/naka'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Guard: Prevent CI Loop') {
            steps {
                script {
                    def msg = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()

                    if (msg.contains('[skip ci]')) {
                        currentBuild.description = 'Skipped CI loop'
                        error('CI loop detected')
                    }
                }
            }
        }

        stage('Generate Version') {
            steps {
                script {
                    def shortSha = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()

                    env.IMAGE_VERSION = "${BUILD_NUMBER}-${shortSha}"
                    echo "Image Version: ${env.IMAGE_VERSION}"
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                sh """
                    docker build -t ${DOCKER_NAMESPACE}/naka-backend:${IMAGE_VERSION} ./backend
                    docker build -t ${DOCKER_NAMESPACE}/naka-frontend:${IMAGE_VERSION} ./frontend

                    docker push ${DOCKER_NAMESPACE}/naka-backend:${IMAGE_VERSION}
                    docker push ${DOCKER_NAMESPACE}/naka-frontend:${IMAGE_VERSION}
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-server-key']) {
                    sh """
                        set -e

                        ssh -o StrictHostKeyChecking=no ec2-user@${DEPLOY_HOST} '
                            mkdir -p ${COMPOSE_DIR}
                        '

                        scp -o StrictHostKeyChecking=no docker-compose.yml \
                            ec2-user@${DEPLOY_HOST}:${COMPOSE_DIR}/docker-compose.yml

                        ssh -o StrictHostKeyChecking=no ec2-user@${DEPLOY_HOST} '
                            set -e
                            cd ${COMPOSE_DIR}

                            export IMAGE_VERSION=${IMAGE_VERSION}

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
