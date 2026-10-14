package f2r.testprep.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

  public record AuthenticatedPrincipal(Long userId, String loginId, String role) {}

  private final TestPrepProperties properties;
  private SecretKey key;

  public JwtTokenProvider(TestPrepProperties properties) {
    this.properties = properties;
  }

  @PostConstruct
  void init() {
    String secret = properties.jwt().secret();
    if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException(
          "TESTPREP_JWT_SECRET is missing or shorter than 32 bytes — set it via environment variable, never commit it.");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  /**
   * 토큰 발급. 정상 운영에서는 feel2real 본체가 발급하고 TestPrep은 검증만 쓴다.
   * 이 메서드는 dev 프로필의 /dev-login 로컬 전용 경로에서만 호출된다.
   */
  public String issue(Long userId, String loginId, String role) {
    Date now = new Date();
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("loginId", loginId)
        .claim("role", role)
        .issuedAt(now)
        .expiration(new Date(now.getTime() + properties.jwt().ttlSeconds() * 1000))
        .signWith(key)
        .compact();
  }

  public AuthenticatedPrincipal parse(String token) {
    try {
      Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
      return new AuthenticatedPrincipal(
          Long.parseLong(claims.getSubject()), claims.get("loginId", String.class), claims.get("role", String.class));
    } catch (Exception e) {
      return null;
    }
  }
}
