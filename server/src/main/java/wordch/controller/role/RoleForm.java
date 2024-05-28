package wordch.controller.role;

import java.util.List;

import lombok.Data;

@Data
public class RoleForm {
  private String role;
  private String user;
  private String dealer;
  private List<String> playerList;

  public String getRole() {
    return role;
}

public String getUser() {
    return user;
}

public String getDealer() {
    return dealer;
}

public List<String> getPlayerList() {
    return playerList;
}
}
