@Library('jenkins-shared-library@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    tools {
        nodejs 'node18'
    }

    environment {
        DOCKER_USER = 'kshitijx07'
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

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Versioning') {
            steps {
                sh '''
                    cd backend
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../backend.version
                    cd ..

                    cd frontend
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../frontend.version
                    cd ..
                '''
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Install') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Install') {
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
                script {
                    def backendVersion = readFile('backend.version').trim()
                    def frontendVersion = readFile('frontend.version').trim()

                    sh """
                        docker build -t ${DOCKER_USER}/naka-backend:v${backendVersion} ./backend
                        docker build -t ${DOCKER_USER}/naka-frontend:v${frontendVersion} ./frontend

                        docker push ${DOCKER_USER}/naka-backend:v${backendVersion}
                        docker push ${DOCKER_USER}/naka-frontend:v${frontendVersion}
                    """
                }
            }
        }

        stage('Deploy using Docker Compose') {
            steps {
                script {
                    def backendVersion = readFile('backend.version').trim()
                    def frontendVersion = readFile('frontend.version').trim()

                    sshagent(['ec2-server-key']) {
                        sh """
                        set -e

                        ssh -o StrictHostKeyChecking=no ec2-user@51.21.1.228 '
                            set -e
                            mkdir -p ${COMPOSE_DIR}
                        '

                        scp -o StrictHostKeyChecking=no docker-compose.yml \
                            ec2-user@51.21.1.228:${COMPOSE_DIR}/docker-compose.yml

                        ssh -o StrictHostKeyChecking=no ec2-user@51.21.1.228 '
                            set -e
                            cd ${COMPOSE_DIR}

                            export BACKEND_VERSION=v${backendVersion}
                            export FRONTEND_VERSION=v${frontendVersion}

                            docker-compose down --remove-orphans
                            docker-compose pull
                            docker-compose up -d
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
            echo '✅ CI/CD completed successfully'
        }
        aborted {
            echo '⏭️ Pipeline aborted'
        }
        failure {
            echo '❌ CI/CD failed'
        }
        always {
            cleanWs()
        }
    }
}
