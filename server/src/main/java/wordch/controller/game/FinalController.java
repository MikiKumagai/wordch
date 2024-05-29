package wordch.controller.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class FinalController {

  @MessageMapping("/final")
  @SendTo("/topic/final")
  public FinalAnswerForm finalAnswer(@RequestBody FinalAnswerForm finalAnswer) throws Exception {
    System.out.println("Final Answer: " + finalAnswer.getFinalAnswer());
    return finalAnswer;
  }

  @MessageMapping("/final/select")
  @SendTo("/topic/final/select")
  public FinalWinnerForm selectWinner(@RequestBody FinalWinnerForm finalWinner) throws Exception {
    return finalWinner;
  }

  
}
