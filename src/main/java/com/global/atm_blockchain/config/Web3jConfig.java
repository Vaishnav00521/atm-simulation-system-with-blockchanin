package com.global.atm_blockchain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {

    // Reads "http://127.0.0.1:7545" from application.properties
    @Value("${web3j.client-address}")
    private String clientAddress;

    @Bean
    public Web3j web3j() {
        // Creates the connection to the Blockchain Node (Ganache)
        return Web3j.build(new HttpService(clientAddress));
    }
}