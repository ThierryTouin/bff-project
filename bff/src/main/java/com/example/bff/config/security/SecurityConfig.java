package com.example.bff.config.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import com.example.bff.filter.CsrfLoggerFilter;
import com.example.bff.filter.ParamHeaderFilter;
import com.fasterxml.jackson.databind.deser.impl.CreatorCandidate.Param;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        OidcTokenLogger oidcTokenLogger,
        CsrfLoggerFilter csrfLoggerFilter,
        ParamHeaderFilter paramHeaderFilter
    ) throws Exception {

        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // repo.setHeaderName("x-xsrf-token");
        
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/webjars/**"
                )
                .csrfTokenRepository(repo)
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .addFilterAfter(csrfLoggerFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(paramHeaderFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/webjars/**",
                    "/actuator/**"
                ).permitAll()
                .requestMatchers("/login/**").authenticated()
                .requestMatchers("/logout/**").authenticated()
                .requestMatchers("/api/secur/**").authenticated()
                .anyRequest().denyAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    // Si appel AJAX : renvoie 401 au lieu d'une redirection
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"UNAUTHORIZED\"}");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oidcTokenLogger)
            );


        return http.build();
    }
}
