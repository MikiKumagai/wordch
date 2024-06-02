package wordch.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import wordch.entity.ThemeEntity;
import wordch.entity.ThemeEntityExample;

@Mapper
public interface ThemeEntityMapper {
    long countByExample(ThemeEntityExample example);

    int deleteByExample(ThemeEntityExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(ThemeEntity row);

    int insertSelective(ThemeEntity row);

    List<ThemeEntity> selectByExample(ThemeEntityExample example);

    ThemeEntity selectByPrimaryKey(Integer id);

    int updateByExampleSelective(@Param("row") ThemeEntity row, @Param("example") ThemeEntityExample example);

    int updateByExample(@Param("row") ThemeEntity row, @Param("example") ThemeEntityExample example);

    int updateByPrimaryKeySelective(ThemeEntity row);

    int updateByPrimaryKey(ThemeEntity row);
}