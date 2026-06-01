package com.example.bff.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class SessionDebugFilter implements Filter {

    private static final Logger LOG =
        LoggerFactory.getLogger(SessionDebugFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            HttpSession session = httpRequest.getSession(false);

            LOG.info("===== SessionDebugFilter =====");
            LOG.info("{} {} JSESSIONID={}",
                httpRequest.getMethod(),
                httpRequest.getRequestURI(),
                session != null ? session.getId() : "NULL"
            );

            // Cookies reçus
            Cookie[] cookies = httpRequest.getCookies();
            if (cookies != null) {
                String cookieInfo = Arrays.stream(cookies)
                    .map(c -> c.getName() + "=" + c.getValue())
                    .collect(Collectors.joining("; "));
                LOG.info("Cookies: {}", cookieInfo);
            } else {
                LOG.info("Cookies: NONE");
            }

            // Headers pertinents pour le debug cross-env
            LOG.info("Host: {} | Origin: {} | Referer: {}",
                httpRequest.getHeader("Host"),
                httpRequest.getHeader("Origin"),
                httpRequest.getHeader("Referer")
            );
            LOG.info("X-Forwarded-For: {} | X-Forwarded-Proto: {} | X-Forwarded-Host: {}",
                httpRequest.getHeader("X-Forwarded-For"),
                httpRequest.getHeader("X-Forwarded-Proto"),
                httpRequest.getHeader("X-Forwarded-Host")
            );

            // Session details
            if (session != null) {
                LOG.info("Session created: {} | lastAccessed: {} | maxInactive: {}s",
                    new java.util.Date(session.getCreationTime()),
                    new java.util.Date(session.getLastAccessedTime()),
                    session.getMaxInactiveInterval()
                );
                Collections.list(session.getAttributeNames()).forEach(attr ->
                    LOG.info("  session attr: {} = {}", attr, session.getAttribute(attr))
                );
            }

            // Infos de sécurité
            LOG.info("RemoteAddr: {} | Secure: {} | Scheme: {}",
                httpRequest.getRemoteAddr(),
                httpRequest.isSecure(),
                httpRequest.getScheme()
            );
            LOG.info("==============================");

            chain.doFilter(request, response);

            // Set-Cookie dans la réponse (après le traitement)
            httpResponse.getHeaderNames().stream()
                .filter(h -> h.equalsIgnoreCase("Set-Cookie"))
                .forEach(h -> httpResponse.getHeaders(h)
                    .forEach(v -> LOG.info("Response Set-Cookie: {}", v))
                );
        } else {
            chain.doFilter(request, response);
        }
    }
}
