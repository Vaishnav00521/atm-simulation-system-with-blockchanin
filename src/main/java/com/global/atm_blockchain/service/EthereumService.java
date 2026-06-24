package com.global.atm_blockchain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.utils.Convert;
import org.web3j.utils.Numeric;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Collections;

@Service
public class EthereumService {

    private final Web3j web3j;

    @Value("${ethereum.private-key}")
    private String privateKey;

    @Value("${ethereum.contract-address}")
    private String contractAddress;

    public EthereumService(Web3j web3j) {
        this.web3j = web3j;
    }

    public String executeTransaction(String type, double amountInEther) throws Exception {
        // 1. Antigravity Enhancement: Fast-fail validation
        if (amountInEther <= 0) throw new IllegalArgumentException("Amount must be greater than zero.");
        if (!type.equalsIgnoreCase("deposit") && !type.equalsIgnoreCase("withdraw")) {
            throw new IllegalArgumentException("Invalid operation type.");
        }

        Credentials credentials = Credentials.create(privateKey);
        
        // 2. Fetch Nonce
        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
        BigInteger nonce = ethGetTransactionCount.getTransactionCount();

        // 3. Convert to Wei & Encode
        BigInteger valueInWei = Convert.toWei(BigDecimal.valueOf(amountInEther), Convert.Unit.ETHER).toBigInteger();
        Function function = new Function(type.toLowerCase(), Collections.emptyList(), Collections.emptyList());
        String encodedFunction = FunctionEncoder.encode(function);

        // 4. Gas Limits
        BigInteger gasLimit = BigInteger.valueOf(300000);
        BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();

        // 5. Build and Sign Transaction
        RawTransaction rawTransaction = RawTransaction.createTransaction(
                nonce, gasPrice, gasLimit, contractAddress, 
                type.equalsIgnoreCase("deposit") ? valueInWei : BigInteger.ZERO, 
                encodedFunction);

        byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, credentials);
        String hexValue = Numeric.toHexString(signedMessage);

        // 6. Antigravity Enhancement: Asynchronous Fire-and-Forget
        // We send the transaction to the network and immediately return the hash without waiting for mining.
        EthSendTransaction response = web3j.ethSendRawTransaction(hexValue).send();

        if (response.hasError()) {
            throw new Exception("Web3 Rejection: " + response.getError().getMessage());
        }

        return response.getTransactionHash(); 
    }
}
