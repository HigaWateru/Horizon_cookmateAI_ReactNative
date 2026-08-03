package demo.server.service;

import java.util.concurrent.TimeUnit;

public interface RedisService {
    void set(String key, Object value, long timeout, TimeUnit unit);
    Object get(String key);
    Boolean delete(String key);
    Boolean hasKey(String key);
    
    void blacklistToken(String token, long expirationInSeconds);
    boolean isTokenBlacklisted(String token);
}
