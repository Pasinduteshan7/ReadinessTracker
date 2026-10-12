import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Properties;

public class DropColumns {
    public static void main(String[] args) {
        try {
            // Read .env file
            String url = "";
            String user = "";
            String password = "";
            List<String> lines = Files.readAllLines(Paths.get("readiness-tracker-backend/.env"));
            for (String line : lines) {
                if (line.startsWith("DATABASE_URL=")) url = line.split("=", 2)[1].trim();
                if (line.startsWith("DATABASE_USERNAME=")) user = line.split("=", 2)[1].trim();
                if (line.startsWith("DATABASE_PASSWORD=")) password = line.split("=", 2)[1].trim();
            }

            Properties props = new Properties();
            props.setProperty("user", user);
            props.setProperty("password", password);
            props.setProperty("ssl", "true");

            try (Connection conn = DriverManager.getConnection(url, props);
                 Statement stmt = conn.createStatement()) {
                
                String[] queries = {
                    "ALTER TABLE analysis_jobs DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE challenge_submissions DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE problem_assignments DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE benchmark_results DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE final_scores DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE github_profiles DROP COLUMN IF EXISTS user_id CASCADE",
                    "ALTER TABLE benchmark_results DROP COLUMN IF EXISTS github_username CASCADE"
                };
                
                for (String q : queries) {
                    try {
                        stmt.executeUpdate(q);
                        System.out.println("Executed: " + q);
                    } catch (Exception e) {
                        System.out.println("Skipped: " + q + " (" + e.getMessage() + ")");
                    }
                }
                System.out.println("Database schema cleaned!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
