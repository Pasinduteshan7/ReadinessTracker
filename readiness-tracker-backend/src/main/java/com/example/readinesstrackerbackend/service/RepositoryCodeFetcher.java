package com.example.readinesstrackerbackend.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to fetch actual source code from GitHub repositories.
 * 
 * Strategy:
 * 1. Fetch README.md (provides context)
 * 2. Fetch main entry point (main.py, App.tsx, index.js, etc)
 * 3. Fetch key module files (5-10 important files)
 * 4. Combine into single string (max 500KB)
 * 5. Return combined code for LLM analysis
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RepositoryCodeFetcher {
    
    private static final String GITHUB_RAW_BASE = "https://raw.githubusercontent.com";
    private static final String GITHUB_API_BASE = "https://api.github.com";
    private static final long MAX_SIZE_BYTES = 500_000;  // 500KB total limit
    private static final int MAX_FILES = 15;  // Max 15 files
    private static final long MAX_FILE_SIZE = 50_000;  // 50KB per file
    
    // Common entry point names
    private static final String[] ENTRY_POINTS = {
        "main.py", "app.py", "run.py", "index.py",
        "main.js", "index.js", "app.js", "server.js",
        "main.ts", "index.ts", "app.ts",
        "main.tsx", "index.tsx", "App.tsx",
        "Main.java", "Application.java"
    };
    
    // Common branch names to try
    private static final String[] BRANCHES = { "main", "master", "develop", "dev" };
    
    // File extensions to include
    private static final String[] INCLUDE_EXTENSIONS = {
        ".py", ".js", ".ts", ".tsx", ".java", ".kt", ".go", ".rb", ".php",
        ".rs", ".cpp", ".c", ".h", ".sql", ".md"
    };
    
    @Value("${github.token:}")
    private String githubToken;
    
    private final RestTemplate restTemplate;
    
    /**
     * Fetch repository code from GitHub
     * 
     * @param username GitHub username
     * @param repoName Repository name
     * @return Combined code string (max 500KB), empty string if fetch fails
     */
    public String fetchRepositoryCode(String username, String repoName) {
        try {
            log.info("🔍 Starting code fetch for {}/{}", username, repoName);
            
            if (username == null || username.isEmpty() || repoName == null || repoName.isEmpty()) {
                log.warn("⚠️  Username or repo name is empty");
                return "";
            }
            
            // Try each branch
            for (String branch : BRANCHES) {
                try {
                    String code = fetchCodeFromBranch(username, repoName, branch);
                    if (!code.isEmpty()) {
                        log.info("✅ Successfully fetched code from branch '{}' for {}/{}", branch, username, repoName);
                        return code;
                    }
                } catch (Exception e) {
                    log.debug("⚠️  Failed to fetch from branch '{}': {}", branch, e.getMessage());
                    // Try next branch
                }
            }
            
            log.warn("⚠️  Could not fetch code from any branch for {}/{}", username, repoName);
            return "";
            
        } catch (Exception e) {
            log.error("❌ Error fetching code for {}/{}: {}", username, repoName, e.getMessage());
            return "";  // Gracefully fallback to empty string
        }
    }
    
    /**
     * Fetch code from a specific branch
     */
    private String fetchCodeFromBranch(String username, String repoName, String branch) throws Exception {
        StringBuilder combined = new StringBuilder();
        long totalSize = 0;
        int fileCount = 0;
        
        // Step 1: Try to fetch README
        String readme = fetchFileContent(username, repoName, "README.md", branch);
        if (readme == null || readme.isEmpty()) {
            readme = fetchFileContent(username, repoName, "README.txt", branch);
        }
        if (readme != null && !readme.isEmpty()) {
            combined.append("## README ##\n").append(readme).append("\n\n");
            totalSize += readme.length();
            fileCount++;
            log.debug("✓ Fetched README ({} bytes)", readme.length());
        }
        
        // Step 2: Try to fetch entry points
        for (String entryPoint : ENTRY_POINTS) {
            if (totalSize >= MAX_SIZE_BYTES || fileCount >= MAX_FILES) break;
            
            String content = fetchFileContent(username, repoName, entryPoint, branch);
            if (content != null && !content.isEmpty() && content.length() <= MAX_FILE_SIZE) {
                combined.append("## ").append(entryPoint).append(" ##\n")
                        .append(content).append("\n\n");
                totalSize += entryPoint.length() + content.length();
                fileCount++;
                log.debug("✓ Fetched entry point {} ({} bytes)", entryPoint, content.length());
                break;  // Only need one entry point
            }
        }
        
        // Step 3: Try to fetch key module files from common directories
        List<String> moduleFiles = getKeyModuleFiles(username, repoName, branch);
        for (String moduleFile : moduleFiles) {
            if (totalSize >= MAX_SIZE_BYTES || fileCount >= MAX_FILES) break;
            
            String content = fetchFileContent(username, repoName, moduleFile, branch);
            if (content != null && !content.isEmpty() && content.length() <= MAX_FILE_SIZE) {
                combined.append("## ").append(moduleFile).append(" ##\n")
                        .append(content).append("\n\n");
                totalSize += moduleFile.length() + content.length();
                fileCount++;
                log.debug("✓ Fetched module {} ({} bytes)", moduleFile, content.length());
            }
        }
        
        String result = combined.toString().trim();
        if (!result.isEmpty()) {
            log.info("📦 Combined code: {} bytes from {} files", totalSize, fileCount);
        }
        return result;
    }
    
    /**
     * Fetch a single file content from GitHub raw content API
     */
    private String fetchFileContent(String username, String repoName, String filePath, String branch) {
        try {
            String url = String.format(
                "%s/%s/%s/%s/%s",
                GITHUB_RAW_BASE, username, repoName, branch, filePath
            );
            
            HttpHeaders headers = new HttpHeaders();
            if (githubToken != null && !githubToken.isEmpty()) {
                headers.set("Authorization", "token " + githubToken);
            }
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            try {
                ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
                );
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    String body = response.getBody();
                    // Validate it's not HTML error page
                    if (!body.contains("404") && !body.contains("Not Found")) {
                        return body;
                    }
                }
            } catch (Exception e) {
                // File doesn't exist or error - return null silently
                log.trace("File not found: {}/{}/{} ({})", username, repoName, filePath, e.getMessage());
            }
            return null;
            
        } catch (Exception e) {
            log.trace("Error fetching file {}/{}/{}: {}", username, repoName, filePath, e.getMessage());
            return null;
        }
    }
    
    /**
     * Get list of key module files to fetch
     * Tries to identify files in src/, lib/, modules/ directories
     */
    private List<String> getKeyModuleFiles(String username, String repoName, String branch) {
        List<String> files = new ArrayList<>();
        
        // Common module file patterns for different languages
        String[][] patterns = {
            // Python
            { "src/main.py", "src/__main__.py", "src/core.py", "src/analyzer.py", "src/service.py", "src/utils.py" },
            { "lib/main.py", "lib/core.py", "lib/analyzer.py" },
            { "modules/main.py", "modules/core.py" },
            
            // JavaScript/TypeScript
            { "src/index.ts", "src/index.tsx", "src/app.ts", "src/app.tsx", "src/main.ts" },
            { "src/index.js", "src/app.js", "src/main.js" },
            { "lib/index.js", "lib/index.ts" },
            
            // Java
            { "src/main/java/com/example/Main.java", "src/main/java/com/example/App.java" },
        };
        
        // Add some general files
        files.addAll(Arrays.asList(
            "package.json",
            "requirements.txt",
            "pom.xml",
            "build.gradle",
            "setup.py",
            "go.mod",
            "Cargo.toml"
        ));
        
        // Add pattern files
        for (String[] patternSet : patterns) {
            files.addAll(Arrays.asList(patternSet));
        }
        
        return files;
    }
    
    /**
     * Helper method to check if a file extension should be included
     */
    private boolean isIncludedExtension(String filePath) {
        for (String ext : INCLUDE_EXTENSIONS) {
            if (filePath.toLowerCase().endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}
