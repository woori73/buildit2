package f2r.testprep.domain.testprep.controller;

import f2r.testprep.config.TestPrepProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Arrays;

@Controller
public class TestPrepHomeController {

  private final TestPrepProperties properties;
  private final Environment environment;

  public TestPrepHomeController(TestPrepProperties properties, Environment environment) {
    this.properties = properties;
    this.environment = environment;
  }

  @GetMapping("/home")
  public String home(Model model) {
    model.addAttribute("pageActive", "home");
    // SSO: 로그인/회원가입은 feel2real 체계 그대로 — 프론트는 이 진입점으로만 보낸다.
    model.addAttribute("ssoLoginUrl", properties.jwt().ssoLoginUrl());
    // 검수 환경 구분: prd가 아니면 개발용 JWT(dev-login) 모드임을 화면에 명시한다.
    // 실제 feel2real 계정 연동은 prd 배포(공유 secret을 env로 주입)에서만 동작한다.
    model.addAttribute("qaMode", !Arrays.asList(environment.getActiveProfiles()).contains("prd"));
    return "testprep/home";
  }
}
