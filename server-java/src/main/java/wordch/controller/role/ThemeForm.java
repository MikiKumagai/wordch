package wordch.controller.role;

import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ThemeForm {

  @Size(min = 1, max = 50)
  private String theme;
  private Boolean isUserInput;

  public String getTheme() {
    return theme;
}

public Boolean getIsUserInput() {
    return isUserInput;
}
}
