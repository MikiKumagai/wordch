package wordch.controller.role;

import lombok.Data;

@Data
public class RoleForm {
  private String role;
  private String user;

  public String getRole() {
    return role;
}

public String getUser() {
    return user;
}

}
