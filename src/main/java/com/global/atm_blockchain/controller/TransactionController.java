package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.service.TransactionService;
import com.global.atm_blockchain.service.UserService;
import com.global.atm_blockchain.service.blockchain.BlockchainService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.security.Principal;

@Controller
public class TransactionController {

    private final UserService userService;
    private final TransactionService transactionService;
    private final BlockchainService blockchainService;

    public TransactionController(UserService userService, TransactionService transactionService, BlockchainService blockchainService) {
        this.userService = userService;
        this.transactionService = transactionService;
        this.blockchainService = blockchainService;
    }

    @PostMapping("/deposit")
    public String deposit(@RequestParam BigDecimal amount, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        transactionService.deposit(user, amount);
        return "redirect:/dashboard";
    }

    @PostMapping("/withdraw")
    public String withdraw(@RequestParam BigDecimal amount, Principal principal, Model model) {
        User user = userService.findByUsername(principal.getName());
        try {
            transactionService.withdraw(user, amount);
        } catch (Exception e) {
            // If error (insufficient funds), send them back to dashboard with error
            return "redirect:/dashboard?error=" + e.getMessage();
        }
        return "redirect:/dashboard";
    }

    @PostMapping("/withdraw-crypto")
    public String withdrawCrypto(@RequestParam BigDecimal amount, Principal principal, Model model) {
        User user = userService.findByUsername(principal.getName());

        try {
            // 1. First, check if they have enough FIAT balance to buy this crypto
            // (In a real app, you'd check exchange rates. Here 1 USD = 1 ETH for simplicity)
            transactionService.withdraw(user, amount);

            // 2. If fiat withdrawal success, send the Crypto
            String txHash = blockchainService.sendCrypto(user.getWalletAddress(), amount);

            return "redirect:/dashboard?success=CryptoSent&txHash=" + txHash;

        } catch (Exception e) {
            return "redirect:/dashboard?error=" + e.getMessage();
        }
    }
}