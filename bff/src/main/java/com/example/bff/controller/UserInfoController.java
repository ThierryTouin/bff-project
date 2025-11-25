package com.example.bff.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
public class UserInfoController {

    private final static Logger LOGGER = LoggerFactory.getLogger(UserInfoController.class);

    @GetMapping("/api/secur/info")
    public Map<String, Object> userInfo(@AuthenticationPrincipal OidcUser oidcUser, HttpServletRequest request) {
        if (oidcUser == null) {
            return Map.of("error", "No authenticated user");
        }

        HttpSession session = request.getSession();
        String clientId = (String) session.getAttribute("clientId");
        if (clientId != null) {
            // parametre a usage unique dans la session
            session.removeAttribute("clientId");
        }


        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(">>>>>>>>>>>>>>>>>>>>>>> found in session clientId : {}",clientId);
        }

        Map<String, Object> userInfoMap =  Map.of(
            "username", oidcUser.getPreferredUsername(),
            "fullName", oidcUser.getFullName(),
            "email", oidcUser.getEmail(),
            "issuer", oidcUser.getIssuer(),
            "claims", oidcUser.getClaims(),
            "clientId", clientId != null ? clientId : ""
        );

        if (LOGGER.isInfoEnabled()) {
            LOGGER.info("userInfoMap : {}",userInfoMap);
        }

        return userInfoMap;
    }
}
