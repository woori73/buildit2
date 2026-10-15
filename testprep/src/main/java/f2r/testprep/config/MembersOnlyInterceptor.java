package f2r.testprep.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

/**
 * 비회원의 회원 전용 URL 직접 진입 시 feel2real 로그인 진입점으로 보낸다.
 * 목적지(next)는 TestPrep 프론트가 이어받아 로그인 후 되돌린다.
 */
public class MembersOnlyInterceptor implements HandlerInterceptor {

  private final TestPrepProperties properties;

  public MembersOnlyInterceptor(TestPrepProperties properties) {
    this.properties = properties;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof JwtTokenProvider.AuthenticatedPrincipal) {
      return true;
    }
    String target = request.getRequestURI();
    if (request.getQueryString() != null) {
      target += "?" + request.getQueryString();
    }
    String loginUrl = properties.jwt().ssoLoginUrl();
    String redirect = loginUrl + (loginUrl.contains("?") ? "&" : "?")
        + "next=" + UriUtils.encode(target, StandardCharsets.UTF_8);
    response.setHeader("Cache-Control", "private, no-store");
    response.sendRedirect(redirect);
    return false;
  }
}
