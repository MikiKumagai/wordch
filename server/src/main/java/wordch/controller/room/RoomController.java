package wordch.controller.room;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.UUID;

@RestController
public class RoomController {

  @GetMapping("/api/room/create")
  public ResponseEntity<String> createRoom() {
      var uuid = UUID.randomUUID().toString();
      uuid = uuid.substring(0, 8);
      return ResponseEntity.ok(uuid);
  }
  
}