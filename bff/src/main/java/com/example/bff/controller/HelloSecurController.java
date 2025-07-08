package com.example.bff.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secur/hello")
public class HelloSecurController {
    
    @GetMapping
    public String sayPublicHello() {
        return "Hello from secur resources";
    }
}