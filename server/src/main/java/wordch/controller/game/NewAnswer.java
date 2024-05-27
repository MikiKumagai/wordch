package wordch.controller.game;

public class NewAnswer {
  private String answer;

  public NewAnswer() {
  }

  public NewAnswer(NewAnswer newAnswer) {
    this.answer = newAnswer.getAnswer();
  }

  public String getAnswer() {
    return answer;
  }

  public void setAnswer(String answer){
    this.answer = answer;
  }
}
