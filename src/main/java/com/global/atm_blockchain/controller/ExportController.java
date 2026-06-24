package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.Transaction;
import com.global.atm_blockchain.repository.TransactionRepository;
import com.global.atm_blockchain.security.AuditLogService;
import com.global.atm_blockchain.service.PdfReceiptService;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * ExportController — Handles exporting transaction data to CSV or PDF formats.
 */
@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PdfReceiptService pdfReceiptService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Export all user transactions as CSV (Tax Export)
     */
    @GetMapping("/transactions/csv")
    public ResponseEntity<String> exportTransactionsCsv(@RequestHeader("Authorization") String tokenHeader) {
        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        List<Transaction> transactions = transactionRepository.findByUser_UsernameOrderByTimestampDesc(username);

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Type,Amount_ETH,Status,Blockchain_Hash,Timestamp\n");

        for (Transaction tx : transactions) {
            csv.append(tx.getId()).append(",");
            csv.append(tx.getType()).append(",");
            csv.append(tx.getAmount()).append(",");
            csv.append(tx.getStatus()).append(",");
            csv.append(tx.getTxHash() != null ? tx.getTxHash() : "None").append(",");
            csv.append(tx.getTimestamp()).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tax_export.csv\"");
        headers.setContentType(MediaType.TEXT_PLAIN);

        auditLogService.logSuccess(username, "TAX_EXPORT", "Exported " + transactions.size() + " records to CSV", "system");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }

    /**
     * Download a PDF receipt for a specific transaction
     */
    @GetMapping("/receipt/pdf/{id}")
    public ResponseEntity<byte[]> downloadPdfReceipt(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable Long id) {
        
        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        Optional<Transaction> txOpt = transactionRepository.findById(id);

        if (txOpt.isEmpty() || !txOpt.get().getUser().getUsername().equals(username)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] pdfBytes = pdfReceiptService.generateReceipt(txOpt.get());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "receipt_" + id + ".pdf");

            auditLogService.logSuccess(username, "RECEIPT_DOWNLOAD", "Downloaded PDF receipt for TX " + id, "system");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Download a PDF statement for all transactions
     */
    @GetMapping("/statement/pdf")
    public ResponseEntity<byte[]> downloadPdfStatement(@RequestHeader("Authorization") String tokenHeader) {
        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        List<Transaction> transactions = transactionRepository.findByUser_UsernameOrderByTimestampDesc(username);

        try {
            byte[] pdfBytes = pdfReceiptService.generateStatement(transactions);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "statement.pdf");

            auditLogService.logSuccess(username, "STATEMENT_DOWNLOAD", "Downloaded PDF statement", "system");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
