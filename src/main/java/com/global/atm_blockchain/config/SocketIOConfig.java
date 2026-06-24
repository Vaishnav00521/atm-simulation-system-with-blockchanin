package com.global.atm_blockchain.config;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DefaultExceptionListener;
import io.netty.channel.ChannelHandlerContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import jakarta.annotation.PreDestroy;
import java.util.List;

@Configuration
public class SocketIOConfig {

    private static final Logger log = LoggerFactory.getLogger(SocketIOConfig.class);

    @Value("${socketio.port:8085}")
    private Integer port;

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("0.0.0.0");
        config.setPort(port);
        // Allow CORS for development
        config.setOrigin("*");

        // Error-free enhancement: Catch all socket-level exceptions so Netty doesn't crash silently
        config.setExceptionListener(new DefaultExceptionListener() {
            @Override
            public void onEventException(Exception e, List<Object> args, SocketIOClient client) {
                log.error("Socket.IO Event Exception for client {}: {}", client.getSessionId(), e.getMessage());
            }

            @Override
            public void onDisconnectException(Exception e, SocketIOClient client) {
                log.error("Socket.IO Disconnect Exception for client {}: {}", client.getSessionId(), e.getMessage());
            }

            @Override
            public void onConnectException(Exception e, SocketIOClient client) {
                log.error("Socket.IO Connect Exception for client {}: {}", client.getSessionId(), e.getMessage());
            }

            @Override
            public boolean exceptionCaught(ChannelHandlerContext ctx, Throwable e) throws Exception {
                log.error("Socket.IO Channel Exception: {}", e.getMessage());
                return true; // Handled
            }
        });

        com.corundumstudio.socketio.SocketConfig socketConfig = new com.corundumstudio.socketio.SocketConfig();
        socketConfig.setReuseAddress(true);
        config.setSocketConfig(socketConfig);

        server = new SocketIOServer(config);
        return server;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startSocketIOServer() {
        if (server != null) {
            try {
                server.start();
                log.info("Socket.IO server successfully started on port {}", port);
            } catch (Exception e) {
                log.error("Failed to start Socket.IO server: {}", e.getMessage(), e);
            }
        }
    }

    @PreDestroy
    public void stopSocketIOServer() {
        if (server != null) {
            server.stop();
        }
    }
}
