@Library('jenkins-shared-library') _

pipeline {
    agent any

    environment {
        DOCKER_CREDS = credentials('docker-hub-credentials') // Replace with your Jenkins credential ID
        BACKEND_IMAGE = "kshitijx07/naka-backend:${env.BUILD_NUMBER}"
        FRONTEND_IMAGE = "kshitijx07/naka-frontend:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Initialization') {
            steps {
                echo 'Cleaning workspace and initializing build...'
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Audit & Lint') {
            parallel {
                stage('Backend Audit') {
                    steps {
                        dir('backend') {
                            sh 'npm audit || true'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    echo 'Building Docker images...'
                    // Note: These steps typically use functions from your shared library
                    // Example: buildAndPush(BACKEND_IMAGE, './backend')
                    
                    dir('backend') {
                        sh "docker build -t ${BACKEND_IMAGE} ."
                    }
                    dir('frontend') {
                        sh "docker build -t ${FRONTEND_IMAGE} ."
                    }
                    
                    sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    echo 'Triggering deployment via Shared Library...'
                    // Example function call from your library
                    // deploy('staging', env.BUILD_NUMBER)
                    
                    // Fallback to direct docker-compose if library step isn't defined
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        always {
            echo 'Finalizing build...'
            cleanWs()
        }
        success {
            echo 'Build Successful! System is live.'
        }
        failure {
            echo 'Build Failed. Please check Jenkins logs above.'
        }
    }
}
