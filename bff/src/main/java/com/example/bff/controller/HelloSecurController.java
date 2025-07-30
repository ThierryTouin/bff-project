package com.example.bff.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secur")
public class HelloSecurController {
    
    @GetMapping("/hello")  
    public String sayPublicHello() {
        return "Hello from secur resources";
    }

    // 🔽 Nouveau endpoint POST
    @PostMapping("/post")
    public String handlePost(@RequestBody Map<String, Object> payload) {
        System.out.println("Received POST data: " + payload);
        return "POST received: " + payload.toString();
    }

}