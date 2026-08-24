package wordch.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import wordch.entity.DefaultValueEntity;
import wordch.entity.DefaultValueEntityExample;

@Mapper
public interface DefaultValueEntityMapper {
    long countByExample(DefaultValueEntityExample example);

    int deleteByExample(DefaultValueEntityExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(DefaultValueEntity row);

    int insertSelective(DefaultValueEntity row);

    List<DefaultValueEntity> selectByExample(DefaultValueEntityExample example);

    DefaultValueEntity selectByPrimaryKey(Integer id);

    int updateByExampleSelective(@Param("row") DefaultValueEntity row, @Param("example") DefaultValueEntityExample example);

    int updateByExample(@Param("row") DefaultValueEntity row, @Param("example") DefaultValueEntityExample example);

    int updateByPrimaryKeySelective(DefaultValueEntity row);

    int updateByPrimaryKey(DefaultValueEntity row);

    List<DefaultValueEntity> selectByRandom();
}