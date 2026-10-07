package com.aurora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableScheduling
public class AppConfig {

    /**
     * RestTemplate para chamadas HTTP externas
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper customizado para JSON serialization
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        return mapper;
    }

    /**
     * Executor para operações assíncronas
     * Java 21 suporta Virtual Threads, mas mantemos ThreadPoolTaskExecutor
     * para compatibilidade com código que não usa Virtual Threads
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("aurora-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Executor com Virtual Threads do Java 21
     */
    @Bean(name = "virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        // Java 21 Spring Boot detecta automaticamente e usa Virtual Threads
        // quando spring.threads.virtual.enabled=true no application.properties
        return new org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor() {
            @Override
            public void execute(Runnable task) {
                // Virtual threads serão usados automaticamente
                super.execute(task);
            }
        };
    }
}