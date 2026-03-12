package com.global.atm_blockchain.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Random;

@Service
@EnableScheduling // Enables the background timer
public class LiveFeedService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();
    private final String[] nodes = {"Frankfurt-01", "Tokyo-04", "NewYork-02", "Mumbai-05", "London-03", "Singapore-08"};
    private final String[] actions = {"Consensus Reached", "Block Validated", "Tx Pool Scanned", "Smart Contract Executed", "Signature Verified"};

    // 🚀 This runs automatically every 3 seconds (3000 ms)
    @Scheduled(fixedRate = 3000)
    public void broadcastLiveNodeFeed() {
        String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        String node = nodes[random.nextInt(nodes.length)];
        String action = actions[random.nextInt(actions.length)];

        // Create the JSON payload
        Map<String, String> liveFeed = Map.of(
                "time", time,
                "node", node,
                "action", action
        );

        // Push it to anyone subscribed to "/topic/live-feed"
        messagingTemplate.convertAndSend("/topic/live-feed", liveFeed);
    }
}