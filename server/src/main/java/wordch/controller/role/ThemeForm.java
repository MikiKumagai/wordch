package wordch.controller.role;

import lombok.Data;

@Data
public class ThemeForm {
  private String theme;
  private Boolean isUserInput;

  public String getTheme() {
    return theme;
}

public Boolean getIsUserInput() {
    return isUserInput;
}
}
