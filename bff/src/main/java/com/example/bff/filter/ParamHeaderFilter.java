package com.example.bff.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;



import java.io.IOException;

@Component
public class ParamHeaderFilter implements Filter {

    private final static Logger LOGGER = LoggerFactory.getLogger(ParamHeaderFilter.class);



    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        System.out.println(">>>>>>>>>>>>>>>>>>>>>>>  🔐 ParamHeaderFilter:");

        // Récupérer le paramètre clientId
        String clientId = httpRequest.getParameter("clientId");

        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(">>>>>>>>>>>>>>>>>>>>>>> clientId : {}",clientId);
        }

        if (clientId != null) {
            // Stocker le clientId dans la session
            HttpSession session = httpRequest.getSession();
            session.setAttribute("clientId", clientId);

            if (LOGGER.isInfoEnabled()) {
                LOGGER.info(">>>>>>>>>>>>>>>>>>>>>>> store clientId in session id : {}",session.getId());
            }
            
        }

        // Continuer la chaîne de filtres
        chain.doFilter(request, response);
    }


    //@Override
    public void doFilter2(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Récupérer le header X-Client-ID
        String clientId = httpRequest.getHeader("X-Client-ID");
        if (clientId != null) {
            // Stocker le clientId dans la session
            HttpSession session = httpRequest.getSession();
            session.setAttribute("clientId", clientId);
        }

        // Continuer la chaîne de filtres
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialisation si nécessaire
    }

    @Override
    public void destroy() {
        // Nettoyage si nécessaire
    }



}
