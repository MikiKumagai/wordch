package wordch.controller.role;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class RoleController {

  @MessageMapping("/role")
  @SendTo("/role_amount")
  public RoleAmount roleAmount(@RequestBody RoleForm roleForm) throws Exception {
    Thread.sleep(1000); 
    RoleAmount roleAmount = new RoleAmount();
    if(roleForm.getRole().equals("player")){
      roleAmount.setPlayer(roleForm.getPlayer() + 1);
    }else if(roleForm.getRole().equals("dealer")){
      roleAmount.setDealer(roleForm.getDealer() + 1);
    }
    return roleAmount;
}

}