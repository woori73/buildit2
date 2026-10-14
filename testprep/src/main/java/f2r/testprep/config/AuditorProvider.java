package f2r.testprep.config;

import f2r.testprep.config.JwtTokenProvider.AuthenticatedPrincipal;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class AuditorProvider implements AuditorAware<String> {

  @Override
  public Optional<String> getCurrentAuditor() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof AuthenticatedPrincipal p) {
      return Optional.of(p.loginId());
    }
    return Optional.of("system");
  }
}
