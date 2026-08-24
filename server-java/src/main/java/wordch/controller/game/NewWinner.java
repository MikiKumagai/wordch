package wordch.controller.game;

public class NewWinner {
  private String winner;

  public NewWinner() {
  }

  public NewWinner(NewWinner newWinner) {
    this.winner = newWinner.getWinner();
  }

  public String getWinner() {
    return winner;
  }

  public void setWinner(String winner){
    this.winner = winner;
  }
}
