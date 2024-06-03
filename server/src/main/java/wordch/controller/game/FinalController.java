package wordch.controller.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class FinalController {

  @MessageMapping("/final/{roomId}")
  @SendTo("/topic/final/{roomId}")
  public FinalAnswerForm finalAnswer(FinalAnswerForm finalAnswer) throws Exception {
    return finalAnswer;
  }

  @MessageMapping("/final/select/{roomId}")
  @SendTo("/topic/final/select/{roomId}")
  public FinalWinnerForm selectWinner(FinalWinnerForm finalWinner) throws Exception {
    return finalWinner;
  }

  @MessageMapping("/final/theme/{roomId}")
  @SendTo("/topic/final/theme/{roomId}")
  public Boolean finalTheme(Boolean show) throws Exception {
    return true;
  }
  
}
