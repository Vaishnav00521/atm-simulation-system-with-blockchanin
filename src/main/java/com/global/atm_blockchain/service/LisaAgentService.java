package com.global.atm_blockchain.service;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LisaAgentService {

    @Autowired
    private UserRepository userRepository;

    public String processCommand(String command, String username, String language) {
        String lowerCommand = command.toLowerCase();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return getLocalizedError("Invalid session. Unable to authenticate.", language);
        }

        // --- INTENT 1: BALANCE INQUIRY ---
        if (lowerCommand.contains("balance") || lowerCommand.contains("portfolio") || lowerCommand.contains("बैलेंस") || lowerCommand.contains("बॅलन्स") || lowerCommand.contains("બેલેન્સ")) {
            return getLocalizedBalance(user.getFiatBalance(), user.getCryptoBalance(), language);
        }

        // --- INTENT 2: NETWORK STATUS ---
        if (lowerCommand.contains("network") || lowerCommand.contains("tps") || lowerCommand.contains("status") || lowerCommand.contains("स्थिति") || lowerCommand.contains("स्थिती")) {
            return "Network Status: Optimal. The Mainnet is currently processing at 1,204 TPS with an average latency of 24ms.";
        }

        // --- INTENT 3: TRANSACTIONS ---
        if (lowerCommand.contains("transfer") || lowerCommand.contains("swap") || lowerCommand.contains("buy") || lowerCommand.contains("send")) {
            return executeTransaction(lowerCommand, user);
        }

        return "I am Lisa, your AI Router. I can process fiat transfers, execute ETH swaps, or retrieve vault analytics. What is your directive?";
    }

    private String executeTransaction(String command, User user) {
        Matcher matcher = Pattern.compile("(\\d+(\\.\\d+)?)").matcher(command);

        if (!matcher.find()) {
            return "Execution halted: I could not determine the exact numeric amount for the transfer.";
        }

        Double amount = Double.parseDouble(matcher.group(1));

        if (command.contains("usdc") || command.contains("fiat") || command.contains("$")) {
            if (user.getFiatBalance() < amount) {
                return String.format("Transaction declined: Insufficient Fiat Reserves. You requested $%.2f but only have $%.2f available.",
                        amount, user.getFiatBalance());
            }

            user.setFiatBalance(user.getFiatBalance() - amount);
            userRepository.save(user);

            return String.format("Ledger Updated: Successfully routed %.2f USDC out of the vault. Your remaining fiat reserve is $%.2f.",
                    amount, user.getFiatBalance());
        }

        return "Execution halted: Please explicitly specify the asset type (USDC) for this transaction.";
    }

    // Helper method for localized balance responses based on LisaAI's language dropdown
    private String getLocalizedBalance(Double fiat, Double crypto, String lang) {
        String fiatStr = String.format("$%.2f", fiat);
        String cryptoStr = String.format("%.4f ETH", crypto);

        return switch (lang) {
            case "hi" -> "आपका वर्तमान फिएट रिज़र्व " + fiatStr + " है और क्रिप्टो वॉल्ट में " + cryptoStr + " है।";
            case "mr" -> "तुमचा वर्तमान फिएट रिझर्व्ह " + fiatStr + " आहे आणि क्रिप्टो वॉल्टमध्ये " + cryptoStr + " आहे.";
            case "gu" -> "તમારું વર્તમાન ફિયાટ રિઝર્વ " + fiatStr + " છે અને ક્રિપ્ટો વૉલ્ટમાં " + cryptoStr + " છે.";
            default -> "Your current Institutional Vault holds " + fiatStr + " in Fiat Reserves and " + cryptoStr + " in the Crypto ledger.";
        };
    }

    private String getLocalizedError(String defaultMsg, String lang) {
        return switch (lang) {
            case "hi" -> "त्रुटि: सत्र अमान्य है।";
            default -> "Error: " + defaultMsg;
        };
    }
}