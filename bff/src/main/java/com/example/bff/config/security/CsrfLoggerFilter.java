package com.example.bff.config.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

@Component
public class CsrfLoggerFilter implements Filter {

    @Override
    public void doFilter(
            jakarta.servlet.ServletRequest servletRequest,
            jakarta.servlet.ServletResponse servletResponse,
            FilterChain filterChain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            System.out.println("Header: " + name + " = " + request.getHeader(name));
        }

        // Log JSESSIONID
        String jsessionId = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("JSESSIONID".equals(cookie.getName())) {
                    jsessionId = cookie.getValue();
                    break;
                }
            }
        }

        if (jsessionId != null) {
            System.out.println("🧾 JSESSIONID: " + jsessionId);
        } else {
            System.out.println("🧾 JSESSIONID: Not found");
        }

        // Log CSRF token
        CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
        if (csrfToken != null) {
            System.out.println("🔐 CSRF Token:");
            System.out.println("  Token     = " + csrfToken.getToken());
            System.out.println("  Parameter = " + csrfToken.getParameterName());
            System.out.println("  Header    = " + csrfToken.getHeaderName());
        }

        filterChain.doFilter(request, response);
    }
}
