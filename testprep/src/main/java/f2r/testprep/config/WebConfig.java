package f2r.testprep.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final TestPrepProperties properties;

  public WebConfig(TestPrepProperties properties) {
    this.properties = properties;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new MembersOnlyInterceptor(properties))
        .addPathPatterns("/testprep/run", "/testprep/review", "/testprep/scores", "/testprep/learning");
  }

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/").setViewName("redirect:/home");
    // 화면 정의: /home 은 TestPrepHomeController(ssoLoginUrl 모델 주입)가,
    // /testprep/** 는 TestPrepPageController(kind 모델 주입)가 담당.
    // /login 은 feel2real 로그인 진입점으로 보낸다 — TestPrep 자체 로그인 화면이 없다.
    registry.addRedirectViewController("/login", "/home");
  }
}
