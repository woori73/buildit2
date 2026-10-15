package f2r.testprep;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import f2r.testprep.config.TestPrepProperties;

@SpringBootApplication
@EnableJpaAuditing
@EnableTransactionManagement
@EnableConfigurationProperties(TestPrepProperties.class)
public class TestPrepApplication {

  public static void main(String[] args) {
    SpringApplication.run(TestPrepApplication.class, args);
  }
}
