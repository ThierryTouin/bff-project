package com.example.bff.config.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        OidcTokenLogger oidcTokenLogger,
        CsrfLoggerFilter csrfLoggerFilter
    ) throws Exception {

        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // repo.setHeaderName("x-xsrf-token");
        
        http
            //.csrf(csrf -> csrf.disable()) // utile pour simplifier les appels depuis Angular pendant le dev
            //.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            
            .csrf(csrf -> csrf
                .csrfTokenRepository(repo)
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()) // <--- sans XOR
            )
            .addFilterAfter(csrfLoggerFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                // accessible sans authent
                .requestMatchers("/api/public/**").permitAll() 
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll() 
                .requestMatchers("/actuator/**").permitAll()
                // nécessite authent
                .requestMatchers("/login/**").authenticated() 
                .requestMatchers("/logout/**").authenticated() 
                .requestMatchers("/api/secur/**").authenticated() 
                .anyRequest().denyAll() // par défaut, tout le reste est bloqué
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oidcTokenLogger)
            )       


        return http.build();
    }
}
