package f2r.testprep.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider tokenProvider;
  private final CookieUtil cookieUtil;

  public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, CookieUtil cookieUtil) {
    this.tokenProvider = tokenProvider;
    this.cookieUtil = cookieUtil;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    if (SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = cookieUtil.readAccessToken(request).orElse(null);
      if (token != null && !token.isBlank()) {
        JwtTokenProvider.AuthenticatedPrincipal principal = tokenProvider.parse(token);
        if (principal != null) {
          var auth = new UsernamePasswordAuthenticationToken(principal, null,
              List.of(new SimpleGrantedAuthority("ROLE_" + principal.role())));
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      }
    }
    chain.doFilter(request, response);
  }
}
