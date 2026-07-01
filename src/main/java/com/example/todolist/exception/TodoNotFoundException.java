package com.example.todolist.exception;

/**
 * Thrown when a todo with a given id does not exist.
 */
public class TodoNotFoundException extends RuntimeException {

    public TodoNotFoundException(Long id) {
        super("Todo not found with id: " + id);
    }
}
