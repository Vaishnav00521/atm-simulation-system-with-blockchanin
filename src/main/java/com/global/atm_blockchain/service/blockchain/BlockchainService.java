package com.global.atm_blockchain.service.blockchain;

import org.springframework.beans.factory.annotation.Value;
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
    private final String bankPrivateKey;

    public BlockchainService(Web3j web3j, @Value("${web3j.private-key}") String bankPrivateKey) {
        this.web3j = web3j;
        this.bankPrivateKey = bankPrivateKey;
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