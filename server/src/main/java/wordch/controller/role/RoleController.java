package wordch.controller.role;

import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import wordch.entity.ThemeEntity;
import wordch.mapper.ThemeEntityMapper;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Controller
public class RoleController {

    @Autowired
    private ThemeEntityMapper themeEntityMapper;

    private static final ConcurrentMap<String, String> roomDealerName = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, Set<String>> roomPlayerNames = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, AtomicLong> roomLastUpdateTime = new ConcurrentHashMap<>();
    private static final long EXPIRATION_TIME_MILLIS = 60000 * 60;

    public RoleController() {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(this::removeStaleEntries, EXPIRATION_TIME_MILLIS, EXPIRATION_TIME_MILLIS, TimeUnit.MILLISECONDS);
    }

    private void updateLastUpdateTime(String roomId) {
        roomLastUpdateTime.put(roomId, new AtomicLong(System.currentTimeMillis()));
    }

    private void removeStaleEntries() {
        long currentTime = System.currentTimeMillis();
        roomLastUpdateTime.forEach((roomId, lastUpdateTime) -> {
            if (currentTime - lastUpdateTime.get() > EXPIRATION_TIME_MILLIS) {
                roomDealerName.remove(roomId);
                roomPlayerNames.remove(roomId);
                roomLastUpdateTime.remove(roomId);
            }
        });
    }

  @MessageMapping("/prepared/{roomId}")
  @SendTo("/topic/prepared/{roomId}")
  public String prepared(@Validated ThemeForm form) throws Exception {
    if(form.getIsUserInput()){
        var entity = new ThemeEntity();
        entity.setTheme(form.getTheme());
        entity.setCreatedBy("user");
        themeEntityMapper.insertSelective(entity);
    }
    return form.getTheme();
  }

  @MessageMapping("/role/{roomId}")
  @SendTo("/topic/role_amount/{roomId}")
  public RoleAmount roleAmount(RoleForm roleForm, @DestinationVariable String roomId) {
    synchronized (this) {
      roomPlayerNames.putIfAbsent(roomId, ConcurrentHashMap.newKeySet());
      updateLastUpdateTime(roomId);

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