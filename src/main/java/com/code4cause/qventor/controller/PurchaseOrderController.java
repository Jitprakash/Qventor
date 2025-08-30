package com.code4cause.qventor.controller;

import com.code4cause.qventor.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/{id}/approve")
    public String approvePurchaseOrder(
            @PathVariable Long id,
            @RequestParam String adminEmail,
            @RequestParam String vendorEmail,
            @RequestParam String vendorName,
            @RequestParam String itemName,
            @RequestParam int quantity,
            @RequestParam double amount
    ) {
        // ⚡️ Fire email service
        emailService.sendPurchaseOrderEmail(
                adminEmail, vendorEmail, vendorName, itemName, quantity, amount
        );

        return " Purchase Order Approved & Email Sent!";
    }
}
