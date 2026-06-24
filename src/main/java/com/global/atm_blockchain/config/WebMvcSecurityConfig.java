package com.global.atm_blockchain.config;

import com.global.atm_blockchain.security.DistributedRateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Registers the DistributedRateLimiter interceptor across ALL endpoints.
 * The interceptor applies before any controller code executes.
 */
@Configuration
public class WebMvcSecurityConfig implements WebMvcConfigurer {

    @Autowired
    private DistributedRateLimiter distributedRateLimiter;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(distributedRateLimiter)
                .addPathPatterns("/**") // Apply to every route
                .excludePathPatterns("/ws-fintech/**"); // Exclude WebSocket handshake
    }
}
