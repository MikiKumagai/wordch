package wordch.controller.game;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;

@Controller
public class FinalController {

  @MessageMapping("/final/{roomId}")
  @SendTo("/topic/final/{roomId}")
  public ResponseEntity<?> finalAnswer(@Validated FinalAnswerForm finalAnswer, 
      BindingResult result) throws Exception {
    if (result.hasErrors()) {
      return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(finalAnswer);
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
