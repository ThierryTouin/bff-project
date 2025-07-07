@EnableWebFluxSecurity
public class SecurityConfig {
  @Bean
  SecurityWebFilterChain security(ServerHttpSecurity http) {
    http
      .oauth2Login()
      .and()
      .logout().logoutUrl("/logout").logoutSuccessUrl("/")
      .and()
      .authorizeExchange(ex -> ex.pathMatchers("/", "/login/**").permitAll()
                                  .anyExchange().authenticated())
      .csrf().csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse());
    return http.build();
  }

  @Bean
  RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
    return builder.routes()
      .route("api", r -> r.path("/api/**")
        .filters(f -> f.stripPrefix(1).tokenRelay())
        .uri("http://apis:8084"))
      .build();
  }
}
