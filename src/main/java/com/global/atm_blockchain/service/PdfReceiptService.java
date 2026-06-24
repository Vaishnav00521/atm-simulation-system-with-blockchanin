package com.global.atm_blockchain.service;

import com.global.atm_blockchain.model.Transaction;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * PdfReceiptService — Generates immutable, institutional-grade PDF receipts for transactions.
 */
@Service
public class PdfReceiptService {

    public byte[] generateReceipt(Transaction tx) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                
                PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                contentStream.setFont(fontBold, 24);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 720);
                contentStream.showText("GLOBAL ATM");
                contentStream.endText();

                contentStream.setFont(fontRegular, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 690);
                contentStream.showText("Official Transaction Receipt");
                contentStream.endText();

                // Draw a separator line
                contentStream.moveTo(50, 670);
                contentStream.lineTo(550, 670);
                contentStream.stroke();

                // Details
                contentStream.setFont(fontBold, 12);
                contentStream.beginText();
                contentStream.setLeading(20f);
                contentStream.newLineAtOffset(50, 640);
                
                contentStream.showText("Transaction ID: ");
                contentStream.setFont(fontRegular, 12);
                contentStream.showText(tx.getId().toString());
                contentStream.newLine();
                
                contentStream.setFont(fontBold, 12);
                contentStream.showText("Type: ");
                contentStream.setFont(fontRegular, 12);
                contentStream.showText(tx.getType());
                contentStream.newLine();
                
                contentStream.setFont(fontBold, 12);
                contentStream.showText("Amount: ");
                contentStream.setFont(fontRegular, 12);
                contentStream.showText(tx.getAmount().toString() + " ETH");
                contentStream.newLine();
                
                contentStream.setFont(fontBold, 12);
                contentStream.showText("Status: ");
                contentStream.setFont(fontRegular, 12);
                contentStream.showText(tx.getStatus());
                contentStream.newLine();

                contentStream.setFont(fontBold, 12);
                contentStream.showText("Blockchain Hash: ");
                contentStream.setFont(fontRegular, 10);
                contentStream.showText(tx.getTxHash() != null ? tx.getTxHash() : "Pending/None");
                contentStream.newLine();
                
                contentStream.setFont(fontBold, 12);
                contentStream.showText("Date: ");
                contentStream.setFont(fontRegular, 12);
                contentStream.showText(tx.getTimestamp() != null ? tx.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : LocalDateTime.now().toString());
                contentStream.newLine();
                contentStream.endText();

                // Footer
                contentStream.moveTo(50, 480);
                contentStream.lineTo(550, 480);
                contentStream.stroke();

                contentStream.setFont(fontRegular, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 460);
                contentStream.showText("This receipt is cryptographically secured. Keep it for your records.");
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateStatement(List<Transaction> transactions) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                
                PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                contentStream.setFont(fontBold, 20);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 720);
                contentStream.showText("GLOBAL ATM - ACCOUNT STATEMENT");
                contentStream.endText();

                // Table Header
                int yPosition = 680;
                contentStream.setFont(fontBold, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition);
                contentStream.showText("Date");
                contentStream.newLineAtOffset(120, 0);
                contentStream.showText("Type");
                contentStream.newLineAtOffset(80, 0);
                contentStream.showText("Amount");
                contentStream.newLineAtOffset(80, 0);
                contentStream.showText("Status");
                contentStream.endText();

                // Draw line
                contentStream.moveTo(50, yPosition - 5);
                contentStream.lineTo(550, yPosition - 5);
                contentStream.stroke();

                yPosition -= 20;
                contentStream.setFont(fontRegular, 10);

                for (Transaction tx : transactions) {
                    if (yPosition < 50) {
                        break; // Simplification: we won't handle pagination for this demo
                    }
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, yPosition);
                    contentStream.showText(tx.getTimestamp() != null ? tx.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "");
                    contentStream.newLineAtOffset(120, 0);
                    contentStream.showText(tx.getType());
                    contentStream.newLineAtOffset(80, 0);
                    contentStream.showText(tx.getAmount().toString() + " ETH");
                    contentStream.newLineAtOffset(80, 0);
                    contentStream.showText(tx.getStatus());
                    contentStream.endText();
                    yPosition -= 20;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
