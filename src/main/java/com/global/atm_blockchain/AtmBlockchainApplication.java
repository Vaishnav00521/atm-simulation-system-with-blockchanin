package com.global.atm_blockchain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AtmBlockchainApplication {

	public static void main(String[] args) {
		// Suppress Netty's "sun.misc.Unsafe" warning on JVM 11+
		System.setProperty("io.netty.noUnsafe", "true");
		System.setProperty("io.netty.tryReflectionSetAccessible", "true");
		
		SpringApplication.run(AtmBlockchainApplication.class, args);
	}

}