package wordch.controller.role;

import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class RoleController {

  // TODO 一定時間操作がないとき削除する

    private static final ConcurrentMap<String, String> roomDealerName = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, Set<String>> roomPlayerNames = new ConcurrentHashMap<>();

  @MessageMapping("/prepared/{roomId}")
  @SendTo("/topic/prepared/{roomId}")
  public Boolean prepared() {
    return true;
  }

  @MessageMapping("/role/{roomId}")
  @SendTo("/topic/role_amount/{roomId}")
  public RoleAmount roleAmount(RoleForm roleForm, @DestinationVariable String roomId) {
    synchronized (this) {
      roomPlayerNames.putIfAbsent(roomId, ConcurrentHashMap.newKeySet());

      Set<String> playerNames = roomPlayerNames.get(roomId);
      String dealerName = roomDealerName.get(roomId);

      String user = roleForm.getUser();
      String role = roleForm.getRole();

      if ("player".equals(role)) {
        if (playerNames.contains(user)) {
            playerNames.remove(user);
        } else if (user.equals(dealerName)) {
            roomDealerName.put(roomId, "");
            playerNames.add(user);
        } else {
            playerNames.add(user);
        }
    } else if ("dealer".equals(role)) {
        if (dealerName == null || dealerName.isEmpty()) {
            if (playerNames.contains(user)) {
                playerNames.remove(user);
            }
            roomDealerName.put(roomId, user);
        } else if (dealerName.equals(user)) {
            roomDealerName.put(roomId, "");
        }
    }
    RoleAmount roleAmount = new RoleAmount();
    roleAmount.setPlayerList(new ArrayList<>(playerNames));
    roleAmount.setDealer(roomDealerName.get(roomId) == "" ? "" : roomDealerName.get(roomId));
    return roleAmount;
}

  }

}