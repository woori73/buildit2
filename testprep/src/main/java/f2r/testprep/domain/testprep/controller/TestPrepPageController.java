package f2r.testprep.domain.testprep.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestPrepPageController {

  @GetMapping("/testprep/practice")
  public String practice(Model model) {
    model.addAttribute("kind", "PRACTICE");
    model.addAttribute("pageActive", "practice");
    return "testprep/catalog";
  }

  @GetMapping("/testprep/vocab")
  public String vocab(Model model) {
    model.addAttribute("kind", "VOCAB");
    model.addAttribute("pageActive", "vocab");
    return "testprep/catalog";
  }

  @GetMapping("/testprep/run")
  public String run(Model model) {
    model.addAttribute("pageActive", "practice");
    return "testprep/run";
  }

  @GetMapping("/testprep/review")
  public String review(Model model) {
    model.addAttribute("pageActive", "scores");
    return "testprep/review";
  }

  @GetMapping("/testprep/scores")
  public String scores(Model model) {
    model.addAttribute("pageActive", "scores");
    return "testprep/scores";
  }

  @GetMapping("/testprep/learning")
  public String learning(Model model) {
    model.addAttribute("pageActive", "learning");
    return "testprep/learning";
  }
}
