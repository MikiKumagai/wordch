package wordch.controller.game;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import wordch.mapper.DefaultValueEntityMapper;
import wordch.mapper.ThemeEntityMapper;

@Controller
public class GameController {

  @Autowired
  ThemeEntityMapper themeMapper;

  @Autowired
  DefaultValueEntityMapper valueMapper;

  @MessageMapping("/start")
  @SendTo("/topic/start")
  public GameValue startGame() throws Exception {
    var game = new GameValue();
    List<String> themeOptions = themeMapper.selectByRandom()
    .stream().map(theme -> theme.getTheme()).toList();
    var defaultValues = valueMapper.selectByRandom();
    var defaultWinner = defaultValues.get(0);
    var defaultChallenger = defaultValues.get(1);
    game.setTheme(themeOptions.toArray(new String[themeOptions.size()]));
    game.setDefaultWinner(defaultWinner.getValue());
    game.setDefaultChallenger(defaultChallenger.getValue());
    return game;
  }

  @MessageMapping("/answer")
  @SendTo("/topic/answer")
  public NewAnswer newAnswer(@RequestBody AnswerForm answerForm) throws Exception {
    var newAnswer = new NewAnswer();
    newAnswer.setAnswer(answerForm.getAnswer());
    return newAnswer;
  }

  @MessageMapping("/winner")
  @SendTo("/topic/winner")
  public NewWinner selectWinner(@RequestBody WinnerForm winnerForm) throws Exception {
    var newWinner = new NewWinner();
    newWinner.setWinner(winnerForm.getWinner());
    return newWinner;
  }

}
