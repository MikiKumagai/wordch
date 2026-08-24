package wordch.config;

import javax.sql.DataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.mybatis.spring.boot.autoconfigure.SpringBootVFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;


/**
 * Mybatisの設定.
 * https://mybatis.org/spring/ja/factorybean.html.
 * https://mybatis.org/mybatis-3/ja/configuration.html.
 */
@Configuration
@MapperScan("wordch.mapper")
public class DatabaseConfig {

  private final DataSource dataSource;
  private final Resource mybatisConfig;

  /**
   * コンストラクタ.
   *
   * @param dataSource データソース
   */
  @Autowired
  public DatabaseConfig(DataSource dataSource) {
    this.mybatisConfig =
        new PathMatchingResourcePatternResolver().getResource("classpath:mybatis-config.xml");
    this.dataSource = dataSource;
  }

  /**
   * SqlSessionFactoryを生成する.
   *
   * @return SqlSessionFactory
   * @throws Exception 例外
   */
  @Bean
  public SqlSessionFactory masterSqlSessionFactory() throws Exception {
    SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
    factoryBean.setDataSource(dataSource);
    factoryBean.setVfs(SpringBootVFS.class);
    factoryBean.setConfigLocation(mybatisConfig);
    return factoryBean.getObject();
  }

}
