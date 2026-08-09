package demo.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseConfig {

    public static class DatabaseUrlCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String dbUrl = System.getenv("DATABASE_URL");
            boolean hasUrl = dbUrl != null && !dbUrl.isEmpty() && 
                    (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"));
            if (hasUrl) {
                log.info("===> Phát hiện DATABASE_URL hợp lệ cho PostgreSQL. Kích hoạt cấu hình tự động...");
            }
            return hasUrl;
        }
    }

    @Bean
    @Primary
    @Conditional(DatabaseUrlCondition.class)
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        try {
            log.info("===> Đang thiết lập kết nối đến database từ DATABASE_URL...");
            
            // Chuẩn hoá tiền tố cho URI parser
            String cleanUrl = databaseUrl;
            if (databaseUrl.startsWith("postgres://")) {
                cleanUrl = "postgresql://" + databaseUrl.substring("postgres://".length());
            }
            
            URI dbUri = new URI(cleanUrl);
            String userInfo = dbUri.getUserInfo();
            String username = userInfo.split(":")[0];
            String password = userInfo.split(":")[1];
            
            String host = dbUri.getHost();
            int port = dbUri.getPort();
            // Lấy đường dẫn DB (bỏ qua dấu gạch chéo đầu tiên)
            String path = dbUri.getPath();
            
            // Tạo JDBC URL
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + (port == -1 ? 5432 : port) + path + "?sslmode=require";
            log.info("===> Cấu hình thành công JDBC URL: {}", jdbcUrl);
            
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (Exception e) {
            log.error("===> Lỗi phân tích cú pháp DATABASE_URL: {}", databaseUrl, e);
            throw new RuntimeException("Không thể cấu hình DataSource từ DATABASE_URL", e);
        }
    }
}
