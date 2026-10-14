package f2r.testprep.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "testprep")
public record TestPrepProperties(Jwt jwt) {

  public record Jwt(
      String secret,
      boolean secureCookie,
      long ttlSeconds,
      // feel2real과 공유하는 인증 쿠키 이름(prd: ACCESS_TOKEN, domain .feel2real.co.kr).
      String cookieName,
      // 빈 문자열이면 host-only 쿠키(로컬). prd에서만 .feel2real.co.kr로 설정.
      String cookieDomain,
      // 비로그인 사용자를 보내는 feel2real 로그인 진입점. feel2real의 /login은 /home의
      // 로그인 모달로 redirect하므로 /home을 기본값으로 쓴다(?next=…는 TestPrep에서 실어간다).
      String ssoLoginUrl) {}

  public TestPrepProperties {
    if (jwt == null) {
      jwt = new Jwt("", false, 86400, "ACCESS_TOKEN", "", "https://feel2real.co.kr/home");
    }
  }
}
