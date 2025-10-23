pipeline {
    agent any 
    
    tools {
        nodejs 'Node-LTS' // Yeh naam Jenkins Tools configuration se match hona chahiye
    }

    environment {
        // Aapka cPanel username
        CPANEL_USER = 'rbbtuomx'
        // Aapke server ka IP address (bina port ke)
        SERVER_IP = '103.212.120.166'
        // Aapke cPanel server ka SSH Port
        SERVER_PORT = '22999' // Ise change karein agar aapka port alag hai
        // cPanel par aapke domain ka path
        DEPLOY_PATH = '/home/rbbtuomx/testproject.company.e-sutra.com'
    }
    
    stages{
    // REMOVED: Global tools block is removed to bypass compilation errors.
    // All tool declarations are moved into the stage's environment block.
        stage('SonarQube Analysis') {
            // New, robust structure to ensure path is set
            environment {
                // Fetch the path to the installed Node.js tool (required for JS/TS analysis)
                // Jenkins will install the tool on demand here.
                NODEJS_HOME = tool 'Node-LTS'
                // CRITICAL: Fetch the path to the installed SonarQube Scanner.
                // This replaces the problematic global 'tools' declaration.
                SONAR_SCANNER_HOME = tool 'SonarQubeScanner'
            }
            steps {
                // 1. Inject the Node.js bin directory into the system PATH
                withEnv(["PATH+NODEJS=${NODEJS_HOME}/bin"]) {
                    // 2. Wrap the execution with the SonarQube Environment
                    withSonarQubeEnv('SonarQube-Server') { 
                        // 3. Execute the scanner using the environment variable set above.
                        sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner"
                    }
                }
            }
        }
        
        // --- Continuous Deployment (CD) Stages ---

        stage('Build Frontend') {
            environment {
                // Re-declare Node.js tool for this stage's environment
                NODEJS_HOME = tool 'Node-LTS'
            }
            steps {
                withEnv(["PATH+NODEJS=${NODEJS_HOME}/bin"]) {
                    // Install dependencies 
                    sh 'npm install'
                    // Build the Vite React application, generating the 'dist' folder
                    sh 'npm run build' 
                }
            }
        }

        // Stage 4: cPanel par deploy karna
        stage('Deploy to cPanel') {
            steps {
                echo "Build files ko cPanel par deploy kar rahe hain: ${DEPLOY_PATH}"
                // Jenkins me save kiye gaye SSH credentials ka use karo
                sshagent(credentials: ['cpanel-ssh-key']) { // Yeh ID Jenkins Credentials se match honi chahiye
                    script {
                        // Pehle purane files delete kar do (Dhyaan se! Path sahi hona chahiye)
                        // SSH ke liye port flag -p (lowercase) use hota hai
                        sh "ssh -p ${env.SERVER_PORT} -o StrictHostKeyChecking=no ${env.CPANEL_USER}@${env.SERVER_IP} 'rm -rf ${env.DEPLOY_PATH}/*'"
                        
                        // Ab naye build files ko 'dist' folder se cPanel par copy karo
                        // SCP ke liye port flag -P (uppercase) use hota hai
                        sh "scp -P ${env.SERVER_PORT} -r dist/* ${env.CPANEL_USER}@${env.SERVER_IP}:${env.DEPLOY_PATH}/"
                    }
                }
            }
        }
    }
    // Pipeline ke poora hone ke baad kya karna hai
    post {
            always {
                script {
                    // 1. Determine Status and Color
                    def buildStatus = currentBuild.result
                    def color = buildStatus == 'SUCCESS' ? 'good' : 'danger'
                    
                    // 2. Determine Emoji
                    // The Slack plugin can handle Unicode emojis like the checkmark and X
                    def emoji = buildStatus == 'SUCCESS' ? ':white_check_mark:' : ':x:'

                    // 3. Construct the Custom Message
                    def customMessage = """
Project Name: *XYZ IN BOLD*
Build No.: #${env.BUILD_NUMBER}
Status: ${emoji} ${buildStatus}
"""
                    // 4. Send the Slack Notification
                    slackSend(
                        channel: '#test-fe-devops', // Use your specific channel name
                        color: color,
                        message: customMessage,
                        tokenCredentialId: 'slack-testfe', // Your Credential ID
                        botUser: true
                    )
                }
            }
    }
}
