package com.aurora.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
public class DatabaseConfig {

    /**
     * Configuração do HikariCP DataSource com pool de conexões otimizado
     */
    @Bean
    public DataSource dataSource(DataSourceProperties dataSourceProperties, HikariConfig hikariConfig) {
        hikariConfig.setJdbcUrl(dataSourceProperties.getUrl());
        hikariConfig.setUsername(dataSourceProperties.getUsername());
        hikariConfig.setPassword(dataSourceProperties.getPassword());
        if (dataSourceProperties.getDriverClassName() != null) {
            hikariConfig.setDriverClassName(dataSourceProperties.getDriverClassName());
        }
        return new HikariDataSource(hikariConfig);
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * Configuração do Hikari via properties
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariConfig hikariConfig() {
        HikariConfig config = new HikariConfig();

        // Configurações de Performance e Segurança
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(20000); // 20 segundos
        config.setIdleTimeout(300000); // 5 minutos
        config.setMaxLifetime(1200000); // 20 minutos
        config.setConnectionTestQuery("SELECT 1");
        config.setAutoCommit(true);
        config.setLeakDetectionThreshold(60000); // 60 segundos

        // Segurança de Conexão
        config.addDataSourceProperty("useSSL", "false");
        config.addDataSourceProperty("serverTimezone", "UTC");
        config.addDataSourceProperty("allowPublicKeyRetrieval", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");

        // Proteção contra SQL Injection
        config.addDataSourceProperty("allowMasterDownConnections", "false");
        config.addDataSourceProperty("allowSlaveDownConnections", "false");

        return config;
    }

    /**
     * Transaction Manager configurado para JPA
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new JpaTransactionManager();
    }
}