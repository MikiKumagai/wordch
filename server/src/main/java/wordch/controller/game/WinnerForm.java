package wordch.controller.game;

import lombok.Data;

@Data
public class WinnerForm {
  private String winner;

  public String getWinner(){
    return winner;
  }
}
