package com.global.atm_blockchain.service.blockchain;

import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Transfer;
import org.web3j.utils.Convert;

import java.math.BigDecimal;

@Service
public class BlockchainService {

    private final Web3j web3j;

    // Placeholder key
    private final String bankPrivateKey = "0xYOUR_GANACHE_PRIVATE_KEY_HERE";

    public BlockchainService(Web3j web3j) {
        this.web3j = web3j;
    }

    public String sendCrypto(String userWalletAddress, BigDecimal amountInEth) throws Exception {
        Credentials credentials = Credentials.create(bankPrivateKey);
        TransactionReceipt receipt = Transfer.sendFunds(
                web3j,
                credentials,
                userWalletAddress,
                amountInEth,
                Convert.Unit.ETHER
        ).send();
        return receipt.getTransactionHash();
    }
}