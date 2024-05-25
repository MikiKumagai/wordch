package wordch.controller.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GameController {
  
  @MessageMapping("/hello")
  @SendTo("/topic/greetings")
  public Greeting greeting(HelloMessage message) throws Exception {
      Thread.sleep(1000); // simulated delay
      return new Greeting(HtmlUtils.htmlEscape(message.getName())
              + " : "
              + HtmlUtils.htmlEscape(message.getMessage()) );
  }
}
