package wordch.controller.game;

import lombok.Data;

@Data
public class FinalAnswerForm {
  private String finalAnswer;
  private String user;

  public String getFinalAnswer() {
    return finalAnswer;
  }
  
}
