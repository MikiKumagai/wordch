package wordch.controller.game;

import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class FinalAnswerForm {

  @Size(min = 1, max = 20)
  private String finalAnswer;
  private String user;

  public String getFinalAnswer() {
    return finalAnswer;
  }

  public String getUser() {
    return user;
  }
  
}
