package f2r.testprep.domain.testprep.repository;

import f2r.testprep.domain.testprep.entity.TpAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TpAttemptRepository extends JpaRepository<TpAttempt, Long> {

  Optional<TpAttempt> findByAttemptIdAndUserId(Long attemptId, Long userId);

  List<TpAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
}
