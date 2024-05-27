package wordch.controller.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class GameController {

  @MessageMapping("/answer")
  @SendTo("/topic/answer")
  public NewAnswer newAnswer(@RequestBody AnswerForm answerForm) throws Exception {
    var newAnswer = new NewAnswer();
    newAnswer.setAnswer(answerForm.getAnswer());
    return newAnswer;
}

}
