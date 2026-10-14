package f2r.testprep.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot 4는 기본 직렬화를 Jackson3(tools.jackson)으로 옮겼고, 그 ObjectMapper 빈만
 * 자동 구성한다. TestPrep의 서비스 코드와 jjwt는 feel2real과 동일한 Jackson2
 * (com.fasterxml.jackson) 계열을 쓰므로, Jackson2 ObjectMapper 빈을 명시해 주입 가능하게 한다.
 * (웹 직렬화는 Boot의 Jackson3 autoconfig이 그대로 담당 — 이 빈은 내부 JSON 파싱/생성 전용.)
 */
@Configuration
public class Jackson2Config {

  @Bean
  public ObjectMapper objectMapper() {
    return new ObjectMapper();
  }
}
