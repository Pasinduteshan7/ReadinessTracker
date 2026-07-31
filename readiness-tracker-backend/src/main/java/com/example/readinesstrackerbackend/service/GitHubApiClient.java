package com.example.readinesstrackerbackend.service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubApiClient {
    private static final String GITHUB_API_BASE = "https://api.github.com";
    private static final String REPOS_ENDPOINT = "/users/{username}/repos";
    @Value("${github.token:}")
    private String githubToken;
    private final RestTemplate restTemplate;
    private final RepositoryCodeFetcher repositoryCodeFetcher;
    public void setGitHubToken(String token) {
        this.githubToken = token;
    }
    
    public String getGitHubToken() {
        return this.githubToken;
    }
    public List<Map<String, Object>> getUserRepositories(String username) {
        return getUserRepositories(username, null);
    }

    public List<Map<String, Object>> getUserRepositories(String username, String tokenOverride) {
        try {
            String activeToken = (tokenOverride != null && !tokenOverride.trim().isEmpty()) ? tokenOverride : this.githubToken;
            log.info("🔍 Fetching repositories for GitHub user: {}", username);
            if (username == null || username.isEmpty()) {
                log.error("GitHub username is null or empty");
                return new ArrayList<>();
            }

            if (activeToken == null || activeToken.isEmpty()) {
                log.warn("⚠️  No GitHub token configured. Rate limits: 60 req/hour (vs 5000 with token)");
                log.warn("   To add token: Set 'github.token=ghp_xxxxx' in application.properties or pass it via UI.");
            }
            List<Map<String, Object>> allRepos = new ArrayList<>();
            int page = 1;
            int pageSize = 100;
            while (true) {

                String url = UriComponentsBuilder.fromUriString(GITHUB_API_BASE + REPOS_ENDPOINT)
                        .queryParam("page", page)
                        .queryParam("per_page", pageSize)
                        .queryParam("sort", "stars")
                        .queryParam("direction", "desc")
                        .buildAndExpand(username)
                        .toString();
                log.info("📡 Fetching repos page {}: {}", page, url);
                try {

                    HttpHeaders headers = new HttpHeaders();
                    headers.set("User-Agent", "Readiness-Tracker-App");
                    headers.set("Accept", "application/vnd.github.v3+json");
                    if (activeToken != null && !activeToken.isEmpty()) {
                        headers.set("Authorization", "token " + activeToken);
                        log.debug("Using authenticated GitHub API request");
                    }
                    HttpEntity<String> entity = new HttpEntity<>(headers);

                    ResponseEntity<List> response = fetchWithRetry(url, entity, 3);
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> pageRepos = response.getBody();
                    if (pageRepos == null || pageRepos.isEmpty()) {
                        log.info("✅ No more repositories found. Total fetched: {}", allRepos.size());
                        break;
                    }
                    log.info("📦 Fetched {} repositories from page {}", pageRepos.size(), page);

                    for (Object repoObj : pageRepos) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> repo = (Map<String, Object>) repoObj;

                        String repoName = (String) repo.getOrDefault("name", "unknown");
                        
                        Map<String, Object> repoData = new HashMap<>();
                        repoData.put("name", repoName);
                        
                        Object cloneUrl = repo.get("clone_url");
                        Object htmlUrl = repo.get("html_url");
                        repoData.put("url", cloneUrl != null ? cloneUrl : (htmlUrl != null ? htmlUrl : ""));
                        
                        Object description = repo.get("description");
                        repoData.put("description", description != null ? description : "");
                        
                        Object language = repo.get("language");
                        repoData.put("language", language != null ? language : "unknown");
                        
                        Object stars = repo.get("stargazers_count");
                        repoData.put("stars", stars != null ? stars : 0);
                        
                        Object forks = repo.get("forks_count");
                        repoData.put("forks", forks != null ? forks : 0);
                        
                        allRepos.add(repoData);
                    }

                    if (pageRepos.size() < pageSize) {
                        log.info("✅ Last page reached. Total repositories: {}", allRepos.size());
                        break;
                    }
                    page++;

                    if (allRepos.size() >= 1000) {
                        log.warn("⚠️  Reached 1000 repository limit. User has more repos available.");
                        break;
                    }
                } catch (Exception pageError) {
                    log.error("❌ Error fetching page {} for user {}: {}", page, username, pageError.getMessage());
                    if (allRepos.isEmpty()) {
                        throw pageError;
                    } else {
                        log.warn("Stopping pagination. Returning {} repos fetched so far", allRepos.size());
                        break;
                    }
                }
            }
            log.info("✅ Successfully fetched {} repositories for user: {}", allRepos.size(), username);
            return allRepos;
        } catch (Exception e) {
            log.error("Error fetching repositories for user: {}", username, e);
            throw new RuntimeException("Failed to fetch repositories from GitHub for user: " + username, e);
        }
    }
    private ResponseEntity<List> fetchWithRetry(String url, HttpEntity<String> entity, int maxRetries) throws Exception {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            } catch (Exception e) {
                String errorMsg = e.getMessage().toLowerCase();

                // Handle 401 Unauthorized (bad token) - retry without token
                if (errorMsg.contains("401") || errorMsg.contains("bad credentials")) {
                    if (entity.getHeaders().get("Authorization") != null) {
                        log.warn("⚠️  GitHub token is invalid (401 Unauthorized). Falling back to unauthenticated request (60 req/hour limit)");
                        HttpHeaders noAuthHeaders = new HttpHeaders();
                        noAuthHeaders.set("User-Agent", "Readiness-Tracker-App");
                        noAuthHeaders.set("Accept", "application/vnd.github.v3+json");
                        HttpEntity<String> noAuthEntity = new HttpEntity<>(noAuthHeaders);
                        try {
                            return restTemplate.exchange(url, HttpMethod.GET, noAuthEntity, List.class);
                        } catch (Exception unauthException) {
                            log.error("❌ Even unauthenticated request failed: {}", unauthException.getMessage());
                            throw unauthException;
                        }
                    } else {
                        throw e;
                    }
                } else if (errorMsg.contains("429") || errorMsg.contains("rate limit") || errorMsg.contains("i/o error") || errorMsg.contains("connection reset") || errorMsg.contains("timeout") || errorMsg.contains("502") || errorMsg.contains("503")) {
                    if (attempt < maxRetries) {
                        long waitTime = (long) Math.pow(2, attempt - 1) * 2000;
                        log.warn("⚠️  GitHub API transient error or rate limit ({}). Retrying in {} ms (attempt {}/{})", e.getMessage(), waitTime, attempt, maxRetries);
                        Thread.sleep(waitTime);
                    } else {
                        log.error("❌ GitHub API failed after {} attempts. Please try again later.", maxRetries);
                        if (errorMsg.contains("429") || errorMsg.contains("rate limit")) {
                            throw new RuntimeException("GitHub API rate limit exceeded. Configure github.token in application.properties", e);
                        }
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
        }
        throw new RuntimeException("Failed to fetch after " + maxRetries + " retries");
    }

    /**
     * Validates a GitHub token by making an authenticated request to GitHub API.
     * @param token The GitHub personal access token to validate
     * @return TokenValidationResult with validity status and message
     */
    public TokenValidationResult validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                log.warn("⚠️  Token validation: Empty token provided");
                return new TokenValidationResult(false, "Token is empty");
            }

            String url = GITHUB_API_BASE + "/user";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Readiness-Tracker-App");
            headers.set("Authorization", "token " + token);
            headers.set("Accept", "application/vnd.github.v3+json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            log.info("🔍 Validating GitHub token...");
            try {
                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    @SuppressWarnings("unchecked")
                    String login = (String) response.getBody().get("login");
                    log.info("✅ GitHub token is VALID for user: {}", login);
                    return new TokenValidationResult(true, "Token is valid for user: " + login);
                } else {
                    log.warn("⚠️  Unexpected response from GitHub API: {}", response.getStatusCode());
                    return new TokenValidationResult(false, "Unexpected GitHub API response: " + response.getStatusCode());
                }
            } catch (Exception e) {
                String errorMsg = e.getMessage().toLowerCase();
                if (errorMsg.contains("401") || errorMsg.contains("bad credentials") || errorMsg.contains("unauthorized")) {
                    log.error("❌ GitHub token is INVALID or EXPIRED: {}", e.getMessage());
                    return new TokenValidationResult(false, "Token is invalid or expired");
                } else if (errorMsg.contains("403") || errorMsg.contains("forbidden")) {
                    log.error("❌ GitHub token does not have required permissions: {}", e.getMessage());
                    return new TokenValidationResult(false, "Token does not have required permissions");
                } else {
                    log.error("❌ Error validating GitHub token: {}", e.getMessage());
                    return new TokenValidationResult(false, "Error validating token: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("❌ Unexpected error during token validation", e);
            return new TokenValidationResult(false, "Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Inner class for token validation response
     */
    public static class TokenValidationResult {
        private final boolean valid;
        private final String message;

        public TokenValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }
    }
}
