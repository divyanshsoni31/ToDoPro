package com.example.todolist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Todo List application.
 *
 * <p>The app keeps all data in memory (see {@code TodoService}) so it needs no
 * database. The frontend is served as static resources from the same server,
 * so running this class starts both the API and the UI.</p>
 */
@SpringBootApplication
public class TodoListApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoListApplication.class, args);
    }
}
