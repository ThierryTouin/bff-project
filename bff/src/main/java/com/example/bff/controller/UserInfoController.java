package com.example.bff.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserInfoController {

    @GetMapping("/api/secur/info")
    public Map<String, Object> userInfo(@AuthenticationPrincipal OidcUser oidcUser) {
        if (oidcUser == null) {
            return Map.of("error", "No authenticated user");
        }

        return Map.of(
            "username", oidcUser.getPreferredUsername(),
            "fullName", oidcUser.getFullName(),
            "email", oidcUser.getEmail(),
            "issuer", oidcUser.getIssuer(),
            "claims", oidcUser.getClaims()
        );
    }
}
