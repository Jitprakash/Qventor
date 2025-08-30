package com.code4cause.qventor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPurchaseOrderEmail(
            String adminEmail,
            String vendorEmail,
            String vendorName,
            String itemName,
            int quantity,
            double amount
    ) {
        LocalDate deliveryDate = LocalDate.now().plusDays(10);

        String subject = "Purchase Order from " + adminEmail;

        //  HTML Email Body
        String body = String.format(
                "<div style='font-family: Arial, sans-serif; line-height:1.6;'>" +
                        "<h2 style='color:#0a1a3d;'>Purchase Order Confirmation</h2>" +
                        "<p>Dear <b>%s</b>,</p>" +
                        "<p>This is an official Purchase Order from <b>%s</b>. Please find the details below:</p>" +

                        "<table style='border-collapse:collapse; width:100%%; margin:20px 0;'>" +
                        "<tr style='background:#0a1a3d; color:#ffffff;'>" +
                        "<th style='padding:8px; border:1px solid #ddd;'>Item</th>" +
                        "<th style='padding:8px; border:1px solid #ddd;'>Quantity</th>" +
                        "<th style='padding:8px; border:1px solid #ddd;'>Total Amount</th>" +
                        "<th style='padding:8px; border:1px solid #ddd;'>Required Delivery Date</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>%s</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>%d</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>₹%.2f</td>" +
                        "<td style='padding:8px; border:1px solid #ddd;'>%s</td>" +
                        "</tr>" +
                        "</table>" +

                        "<p>Please confirm receipt of this order at your earliest convenience.</p>" +
                        "<p>Regards,<br><b>%s</b></p>" +
                        "</div>",
                vendorName, adminEmail,
                itemName, quantity, amount, deliveryDate,
                adminEmail
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(vendorEmail);
            helper.setSubject(subject);
            helper.setText(body, true); //  true = HTML

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send purchase order email: " + e.getMessage(), e);
        }
    }
}
