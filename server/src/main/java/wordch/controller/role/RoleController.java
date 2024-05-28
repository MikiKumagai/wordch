package wordch.controller.role;

import java.util.ArrayList;
import java.util.List;

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
      if(roleForm.getPlayerList() != null && roleForm.getPlayerList().contains(roleForm.getUser())){
        // UserがすでにPlayerだったらPlayerListから削除する
        List<String> playerList = new ArrayList<>(roleForm.getPlayerList());
        playerList.remove(roleForm.getUser());
        roleAmount.setPlayerList(playerList);
        roleAmount.setDealer(roleForm.getDealer());
      } else if(roleForm.getDealer() != null && roleForm.getDealer().equals(roleForm.getUser())){
        // UserがDealerだったらDealerを削除して、Playerに追加
        List<String> playerList = new ArrayList<>(roleForm.getPlayerList());
        playerList.add(roleForm.getUser());
        roleAmount.setPlayerList(playerList);
        roleAmount.setDealer(null);
      } else {
        // UserがDealerでもPlayerでもなかったらPlayerに追加
        List<String> playerList = roleForm.getPlayerList() != null ? new ArrayList<>(roleForm.getPlayerList()) : new ArrayList<>();
        playerList.add(roleForm.getUser());
        roleAmount.setPlayerList(playerList);
        roleAmount.setDealer(roleForm.getDealer());
      }
    } else if(roleForm.getRole().equals("dealer")){
      if (roleForm.getDealer() == null || roleForm.getDealer().equals("")) {
        // Dealerがいないとき
        if (roleForm.getPlayerList() != null && roleForm.getPlayerList().contains(roleForm.getUser())){
          // UserがPlayerだったらPlayerListから削除して、Dealerに追加
          List<String> playerList = new ArrayList<>(roleForm.getPlayerList());
          playerList.remove(roleForm.getUser());
          roleAmount.setPlayerList(playerList);
          roleAmount.setDealer(roleForm.getUser());
        } else {
          // UserがDealerでもPlayerでもなかったらDealerに追加
          roleAmount.setPlayerList(roleForm.getPlayerList());
          roleAmount.setDealer(roleForm.getUser());
        }
      } else {
        // Dealerがすでにいるとき
        if (roleForm.getDealer().equals(roleForm.getUser())){
          // UserがDealerだったら削除
          roleAmount.setPlayerList(roleForm.getPlayerList());
          roleAmount.setDealer(null);
        } else {
          roleAmount.setPlayerList(roleForm.getPlayerList());
          roleAmount.setDealer(roleForm.getDealer());
        }
      }
    }else{
      System.err.println("unknown role:" + roleForm.getRole());
      roleAmount.setPlayerList(roleForm.getPlayerList());
      roleAmount.setDealer(roleForm.getDealer());
    }
    return roleAmount;
}

}