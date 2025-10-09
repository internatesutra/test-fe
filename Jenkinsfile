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
                    // Paste the generated Groovy step here
                    ftpPublisher(
                        alwaysPublishFromMaster: false, 
                        continueOnError: false, 
                        failOnError: false, 
                        publishers: [[
                            configName: 'cPanel-FTP-Server', 
                            transfers: [[
                                asciiMode: false, 
                                cleanRemote: true, 
                                excludes: '', 
                                flatten: false, 
                                makeEmptyDirs: false, 
                                noDefaultExcludes: false, 
                                patternSeparator: '[, ]+', 
                                remoteDirectory: 'public_html', 
                                remoteDirectorySDF: false, 
                                removePrefix: 'dist', 
                                sourceFiles: 'dist/**'
                            ]], 
                            usePromotionTimestamp: false, 
                            useWorkspaceInPromotion: false, 
                            verbose: false
                        ]]
                    )
                }
            }
        }
    }
}
