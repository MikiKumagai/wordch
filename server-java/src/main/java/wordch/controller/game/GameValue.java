package wordch.controller.game;

public class GameValue {

  private String[] theme;
  private String defaultWinner;
  private String defaultChallenger;

  public GameValue() {
  }

  public GameValue(GameValue gameValue) {
    this.theme = gameValue.getTheme();
    this.defaultWinner = gameValue.getDefaultWinner();
    this.defaultChallenger = gameValue.getDefaultChallenger();
  }

  public String[] getTheme() {
    return theme;
  }

  public void setTheme(String[] theme){
    this.theme = theme;
  }

  public String getDefaultWinner() {
    return defaultWinner;
  }

  public void setDefaultWinner(String defaultWinner){
    this.defaultWinner = defaultWinner;
  }

  public String getDefaultChallenger() {
    return defaultChallenger;
  }

  public void setDefaultChallenger(String defaultChallenger){
    this.defaultChallenger = defaultChallenger;
  }
  
}
