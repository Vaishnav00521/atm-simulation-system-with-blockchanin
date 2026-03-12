package com.global.atm_blockchain.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // This is the prefix for messages sent FROM the server TO the client
        config.enableSimpleBroker("/topic");
        // This is the prefix for messages sent FROM the client TO the server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the endpoint React will connect to
        registry.addEndpoint("/ws-fintech")
                .setAllowedOriginPatterns("*") // Allow React to connect
                .withSockJS(); // Fallback for browsers that don't support raw WebSockets
    }
}