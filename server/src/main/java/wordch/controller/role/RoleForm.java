package wordch.controller.role;

import lombok.Data;

@Data
public class RoleForm {
  private String role;
  private Integer player;
  private Integer dealer;

  public String getRole(){
    return role;
  }

  public Integer getPlayer(){
    return player;
  }

  public Integer getDealer(){
    return dealer;
  }

  public void setPlayer(Integer player){
    this.player = player;
  }

  public void setDealer(Integer dealer){
    this.dealer = dealer;
  }

  public void setRole(String role){
    this.role = role;
  }
}
