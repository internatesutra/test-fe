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
                // NOTE: This requires the 'FTP Publisher Plugin' (ftp-publisher) to be installed.
                // You must configure the FTP server in 'Manage Jenkins -> Configure System'.
                ftpPublisher(
                    // 'cPanel-FTP-Server' is the Name of the FTP server config from Jenkins Global Config
                    // The cPanel user and credentials configured globally will be used.
                    // The server user must have write access to the target path.
                    // IMPORTANT: FTP does NOT allow remote 'execCommand' for tasks like 'chmod' 
                    // or creating a '.htaccess' file for SPA routing. These must be done 
                    // manually or via a different method (like SFTP/SSH if access is fixed).
                    publishers: [
                        ftp: [
                            site: 'cPanel-FTP-Server', 
                            transfers: [
                                [
                                    // Set this to true to delete all existing files on the server 
                                    // before transferring new ones (clean deployment)
                                    clean: true, 
                                    // Source directory where 'dist' folder is located
                                    sourceFiles: 'dist/**', 
                                    // The FTP command will remove this prefix from the source path
                                    removePrefix: 'dist', 
                                    // The target directory on cPanel (relative to FTP user's home)
                                    remoteDirectory: '/', 
                                    // Ensure files are transferred in binary mode (important for images/assets)
                                    flatten: false, 
                                    // Always set to true if 'clean: true' is used above
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
