package com.example.readinesstrackerbackend.config;

import org.hibernate.boot.model.naming.ImplicitNamingStrategy;
import org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.dialect.PostgreSQLDialect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

@Configuration
public class HibernateConfiguration {

    /**
     * Configure JPA vendor adapter to skip dialect detection
     * This prevents Hibernate from querying database metadata during startup
     */
    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
        adapter.setDatabasePlatform("org.hibernate.dialect.PostgreSQLDialect");
        adapter.setShowSql(false);
        adapter.setGenerateDdl(false);
        return adapter;
    }

    /**
     * Configure naming strategies to work with PostgreSQL
     */
    @Bean
    public ImplicitNamingStrategy implicitNamingStrategy() {
        return new ImplicitNamingStrategyJpaCompliantImpl();
    }

    @Bean
    public PhysicalNamingStrategy physicalNamingStrategy() {
        return new PhysicalNamingStrategyStandardImpl();
    }
}
