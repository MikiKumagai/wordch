package wordch.controller.admin;

import org.springframework.web.bind.annotation.RestController;

import wordch.entity.ThemeEntity;
import wordch.mapper.ThemeEntityMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;



@RestController
public class AdminController {

  @Autowired
   ThemeEntityMapper themeEntityMapper;

  @GetMapping("/api/admin")
  public List<ThemeEntity> getThemeList() {
    List<ThemeEntity> entity = themeEntityMapper.selectByExample(null);
    return entity;
  }

  @GetMapping("/api/admin/edit/{themeId}")
  public ResponseEntity<?> editTheme(@PathVariable("themeId") Integer themeId) {
    ThemeEntity entity = themeEntityMapper.selectByPrimaryKey(themeId);
    if(entity.getActive() == true) {
      entity.setActive(false);
    } else {
      entity.setActive(true);
    }
    themeEntityMapper.updateByPrimaryKey(entity);
    return ResponseEntity.ok("edit theme"+entity.getTheme());
  }

  @GetMapping("/api/admin/delete/{themeId}")
  public ResponseEntity<?> deleteTheme(@PathVariable("themeId") Integer themeId) {
    themeEntityMapper.deleteByPrimaryKey(themeId);
    return ResponseEntity.ok("delete theme"+themeId);
  }
  
  
}
