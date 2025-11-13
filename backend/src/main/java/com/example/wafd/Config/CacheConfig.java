package com.example.wafd.Config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "pilgrims",
            "agencies",
            "tents",
            "beds",
            "users",
            // Search and filter results caches
            "pilgrimSearch",
            "agencySearch",
            "bedSearch",
            "tentSearch",
            // Static data caches
            "settings",
            "categories"
        );
    }
}