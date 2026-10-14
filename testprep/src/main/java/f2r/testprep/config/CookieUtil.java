package f2r.testprep.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * feel2real과 공유하는 ACCESS_TOKEN 쿠키의 읽기/삭제 헬퍼.
 * 발급(write)은 TestPrep이 하지 않는다 — 회원 가입·로그인은 feel2real이 전담하고,
 * TestPrep은 같은 HS256 secret으로 서명된 쿠키를 검증만 한다(SSO).
 */
@Component
public class CookieUtil {

  private final TestPrepProperties properties;

  public CookieUtil(TestPrepProperties properties) {
    this.properties = properties;
  }

  public Optional<String> readAccessToken(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) return Optional.empty();
    for (Cookie c : cookies) {
      if (properties.jwt().cookieName().equals(c.getName())) {
        return Optional.ofNullable(c.getValue()).filter(v -> !v.isEmpty());
      }
    }
    return Optional.empty();
  }

  /**
   * 공유 쿠키를 지운다. domain-scoped 쿠키는 발급과 동일한 Domain으로만 삭제되므로
   * cookieDomain 설정이 있으면 함께 붙인다. 주의: 이 쿠키는 feel2real 본체와 공유된
   * 세션이므로 삭제 시 양 서비스에서 모두 로그아웃된다.
   */
  public void clearAccessToken(HttpServletResponse response) {
    StringBuilder cookie = new StringBuilder(properties.jwt().cookieName()).append("=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    String domain = properties.jwt().cookieDomain();
    if (domain != null && !domain.isBlank()) {
      cookie.append("; Domain=").append(domain);
    }
    response.addHeader("Set-Cookie", cookie.toString());
  }
}
