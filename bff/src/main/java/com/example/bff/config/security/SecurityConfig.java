package com.example.bff.config.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                    OidcTokenLogger oidcTokenLogger) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // utile pour simplifier les appels depuis Angular pendant le dev
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/public/**").permitAll() // accessible sans authent
                .requestMatchers("/api/secur/**").authenticated() // nécessite authent
                .anyRequest().denyAll() // par défaut, tout le reste est bloqué
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oidcTokenLogger)
            );
            // .oauth2ResourceServer(oauth2 -> oauth2
            //     .jwt() // nécessaire si tu veux sécuriser avec un token d'accès et non une session
            // );

        return http.build();
    }
}
