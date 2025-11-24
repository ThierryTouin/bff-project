package com.example.bff.config.security;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
public class OidcTokenLogger implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OidcTokenLogger.class);

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        org.springframework.security.core.Authentication authentication) throws IOException {

        if (authentication instanceof OAuth2AuthenticationToken tokenAuth) {
            var principal = tokenAuth.getPrincipal();
            if (principal instanceof OidcUser oidcUser) {
                log.info("==== OIDC Authentication Success ====");
                log.info("Subject: {}", oidcUser.getSubject());
                log.info("Email: {}", oidcUser.getEmail());
                log.info("Access Token: {}", oidcUser.getIdToken().getTokenValue());
                log.info("Access Token Claims: {}", oidcUser.getIdToken().getClaims());
                log.info("UserInfo Claims: {}", oidcUser.getUserInfo());
            }
        }

        // Redirection par défaut après authentification
        response.sendRedirect("/");

    }
}