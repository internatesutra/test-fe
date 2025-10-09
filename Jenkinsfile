pipeline {
    agent any 
    
    // REMOVED: Global tools block is removed to bypass compilation errors.
    // All tool declarations are moved into the stage's environment block.
    stages {
        stage('SCM') {
            steps { checkout scm }
        }
        
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

        stage('Deploy to cPanel (via FTP)') {
            steps {
                script {
                    // This is the structure used by the FTP Publisher Plugin
                    // The site name is passed inside the 'transfer' block.
                    // This syntax is much more robust than the declarative wrapper.
                    ftpPublisher(
                        // These parameters handle error states and execution location
                        continueOnError: false, 
                        failOnError: true, 
                        alwaysPublishFromMaster: false, 
                        
                        publishers: [
                            // Define the publisher group. The 'configName' or 'site' 
                            // is usually defined within the transfer itself when 
                            // using this syntax.
                            [
                                // This block defines the actual transfer details
                                transfers: [
                                    // CRITICAL: Ensure the site name and clean flag are nested correctly
                                    [
                                        // The FTP Site Name MUST be passed here:
                                        site: 'cPanel-FTP-Server', // Name from Manage Jenkins -> FTP Configuration
                                        
                                        // Transfer details
                                        sourceFiles: 'dist/**',
                                        removePrefix: 'dist',
                                        remoteDirectory: 'public_html',
                                        
                                        // Use the clean flag if needed (delete files before transfer)
                                        clean: true,
                                        flatten: false, 
                                        remoteDirectorySDF: false 
                                    ]
                                ]
                            ]
                        ]
                    )
                }
            }
        }
    }
}
