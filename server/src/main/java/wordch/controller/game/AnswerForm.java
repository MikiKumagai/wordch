package wordch.controller.game;

import lombok.Data;

@Data
public class AnswerForm {
  private String answer;

  public String getAnswer(){
    return answer;
  }
}
