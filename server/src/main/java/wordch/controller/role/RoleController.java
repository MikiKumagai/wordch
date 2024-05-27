package wordch.controller.role;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class RoleController {

  @MessageMapping("/role")
  @SendTo("/topic/role_amount")
  public RoleAmount roleAmount(@RequestBody RoleForm roleForm) throws Exception {
    RoleAmount roleAmount = new RoleAmount();
    if(roleForm.getRole().equals("player")){
      roleAmount.setPlayer(roleForm.getPlayer() + 1);
    }else if(roleForm.getRole().equals("dealer")){
      if(roleForm.getDealer() > 0){
        roleAmount.setDealer(1);
      }
      roleAmount.setDealer(roleForm.getDealer() + 1);
    }else{
      System.err.println("unknown role:" + roleForm.getRole());
    }
    return roleAmount;
}

}