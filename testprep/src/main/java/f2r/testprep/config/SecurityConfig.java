package f2r.testprep.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(f -> f.disable())
        .httpBasic(b -> b.disable())
        // 미인증 API 접근은 403(기본 Http403ForbiddenEntryPoint)이 아니라 401 —
        // 프론트(testprep.js)가 401을 보고 feel2real SSO 로그인 모달을 띄운다.
        // /testprep/** 페이지들은 security상 permitAll이며 MembersOnlyInterceptor가 redirect 처리.
        .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/home", "/login", "/css/**", "/js/**", "/img/**",
                "/favicon.ico", "/error").permitAll()
            // SSO: 로그인/가입 화면은 feel2real에 있으므로 TestPrep의 auth API는 신원 조회/세션 정리뿐.
            // dev-login은 @Profile("!prd") 빈이라 prd에서는 매처가 아무것도 중개하지 않는다(404).
            .requestMatchers("/api/auth/logout", "/api/auth/dev-login").permitAll()
            .requestMatchers("/api/auth/me").authenticated()
            // 비로그인 사용자의 시험 카탈로그 열람만 허용, 응시/성적은 SSO 인증 필수
            .requestMatchers("/api/testprep/exams").permitAll()
            .requestMatchers("/api/testprep/**").authenticated()
            .anyRequest().permitAll())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
