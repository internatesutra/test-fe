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
        
        // You would typically have a 'Deploy' stage here
    }
}
