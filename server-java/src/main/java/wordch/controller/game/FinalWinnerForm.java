package wordch.controller.game;

import lombok.Data;

@Data
public class FinalWinnerForm {
  private String finalWinner;

  public String getFinalWinner() {
    return finalWinner;
  }
}
