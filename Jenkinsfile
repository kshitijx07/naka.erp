@Library('jenkins-shared-library@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    tools {
        nodejs 'node20'
    }

    environment {
        DOCKER_USER   = 'kshitij2511'
        DEPLOY_HOST   = '13.48.130.59'
        COMPOSE_DIR   = '/home/ec2-user/naka'
        GIT_REPO      = 'https://github.com/kshitijx07/naka.erp.git'
        BRANCH        = 'main'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def msg = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    env.IS_SKIP_CI = msg.contains('[skip ci]').toString()
                    echo "Skip CI: ${env.IS_SKIP_CI}"
                }
            }
        }

        stage('Docker Login') {
            when { expression { env.IS_SKIP_CI == 'false' } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER_VAR',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER_VAR" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push Images') {
            when { expression { env.IS_SKIP_CI == 'false' } }
            steps {
                script {

                    // Bump version atomically
                    sh '''
                        cd backend
                        npm version patch --no-git-tag-version
                        cd ../frontend
                        npm version patch --no-git-tag-version
                        cd ..
                    '''

                    def version = sh(
                        script: "node -p \"require('./backend/package.json').version\"",
                        returnStdout: true
                    ).trim()

                    env.IMAGE_VERSION = version
                    echo "Building Version: ${version}"

                    sh """
                        docker build -t ${DOCKER_USER}/naka-backend:${version} ./backend
                        docker build -t ${DOCKER_USER}/naka-frontend:${version} ./frontend

                        docker tag ${DOCKER_USER}/naka-backend:${version} ${DOCKER_USER}/naka-backend:latest
                        docker tag ${DOCKER_USER}/naka-frontend:${version} ${DOCKER_USER}/naka-frontend:latest

                        docker push ${DOCKER_USER}/naka-backend:${version}
                        docker push ${DOCKER_USER}/naka-frontend:${version}

                        docker push ${DOCKER_USER}/naka-backend:latest
                        docker push ${DOCKER_USER}/naka-frontend:latest
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            when { expression { env.IS_SKIP_CI == 'false' } }
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

                                docker compose pull
                                docker compose up -d --remove-orphans

                                docker image prune -af
                            '
                        """
                    }
                }
            }
        }

        stage('Commit Version Bump') {
            when { expression { env.IS_SKIP_CI == 'false' } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git config user.email "ci@naka.com"
                        git config user.name "naka-ci"

                        git add backend/package.json frontend/package.json
                        git commit -m "chore(release): v${IMAGE_VERSION} [skip ci]" || echo "No changes"

                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/kshitijx07/naka.erp.git HEAD:${BRANCH}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Successful"
            echo "Deployed Version: ${IMAGE_VERSION}"
        }
        failure {
            echo "Pipeline Failed"
        }
        always {
            cleanWs()
        }
    }
}