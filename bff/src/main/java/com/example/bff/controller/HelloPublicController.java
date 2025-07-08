package com.example.bff.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/hello")
public class HelloPublicController {
    
    @GetMapping
    public String sayPublicHello() {
        return "Hello from public resources";
    }
}
