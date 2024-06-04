package wordch.controller.game;

import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class AnswerForm {

  @Size(min = 1, max = 20)
  private String answer;

  public String getAnswer(){
    return answer;
  }
}
