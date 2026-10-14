package f2r.testprep.domain.auth;

import f2r.testprep.config.CookieUtil;
import f2r.testprep.config.JwtTokenProvider;
import f2r.testprep.config.JwtTokenProvider.AuthenticatedPrincipal;
import f2r.testprep.config.TestPrepProperties;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * feel2real JWT 공유 SSO 어댑터.
 *
 * <p>TestPrep은 회원을 발급하지 않는다 — 가입/로그인은 feel2real 체계 그대로 사용하고,
 * feel2real이 발행한 ACCESS_TOKEN 쿠키를 같은 secret(HS256)으로 검증만 한다.
 * identity는 토큰 claim(userId=subject, loginId, role)에서 곧바로取自하며 DB 조회가 없다.
 */
@RestController
@RequestMapping("/api/auth")
public class SsoAuthController {

  private final JwtTokenProvider tokenProvider;
  private final CookieUtil cookieUtil;
  private final TestPrepProperties properties;

  public SsoAuthController(JwtTokenProvider tokenProvider, CookieUtil cookieUtil,
      TestPrepProperties properties) {
    this.tokenProvider = tokenProvider;
    this.cookieUtil = cookieUtil;
    this.properties = properties;
  }

  @GetMapping("/me")
  public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(Map.of(
        "userId", principal.userId(),
        "loginId", principal.loginId(),
        "role", principal.role(),
        "ssoLoginUrl", properties.jwt().ssoLoginUrl()));
  }

  /**
   * 공유 ACCESS_TOKEN 쿠키를 지운다. feel2real 본체와 세션을 공유하므로 양 서비스가 모두
   * 로그아웃된다 — 프론트에서 이 점을 명시적으로 안내한다(testprep.js).
   */
  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletResponse response) {
    cookieUtil.clearAccessToken(response);
    return ResponseEntity.noContent().build();
  }

  /**
   * 로컬 개발 전용 로그인. 운영(prd) 프로필에서는 빈 자체가 등록되지 않는다.
   * feel2real 로컬과 동일한 기본 secret으로 ACCESS_TOKEN 쿠키를 발행해 로컬 SSO를 재현한다.
   */
  @Profile("!prd")
  @RestController
  @RequestMapping("/api/auth/dev-login")
  static class DevLoginController {

    private final JwtTokenProvider tokenProvider;
    private final CookieUtil cookieUtil;
    private final TestPrepProperties properties;

    DevLoginController(JwtTokenProvider tokenProvider, CookieUtil cookieUtil,
        TestPrepProperties properties) {
      this.tokenProvider = tokenProvider;
      this.cookieUtil = cookieUtil;
      this.properties = properties;
    }

    record DevLoginRequest(Long userId, String loginId, String role) {}

    @PostMapping
    public ResponseEntity<Map<String, Object>> devLogin(@RequestBody DevLoginRequest req,
        HttpServletResponse response) {
      if (req.userId() == null || req.loginId() == null || req.loginId().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and loginId are required");
      }
      String role = (req.role() == null || req.role().isBlank()) ? "STUDENT" : req.role();
      // 운영 발급은 feel2real 몫이므로 CookieUtil에 write가 없다 — dev 경로는 직접 Set-Cookie
      // (host-only, 로컬이므로 Secure 없음).
      String token = tokenProvider.issue(req.userId(), req.loginId(), role);
      response.addHeader("Set-Cookie", properties.jwt().cookieName() + "=" + token
          + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + properties.jwt().ttlSeconds());
      return ResponseEntity.ok(Map.of(
          "userId", req.userId(), "loginId", req.loginId(), "role", role));
    }
  }
}
