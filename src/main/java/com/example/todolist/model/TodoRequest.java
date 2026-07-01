package com.example.todolist.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Incoming payload for creating or updating a todo.
 *
 * <p>{@code completed} and {@code priority} are optional; when omitted they
 * default to {@code false} and {@link Priority#MEDIUM} respectively.</p>
 */
public record TodoRequest(

        @NotBlank(message = "Title must not be blank")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        Boolean completed,

        Priority priority
) {
    public boolean resolvedCompleted() {
        return completed != null && completed;
    }

    public Priority resolvedPriority() {
        return priority != null ? priority : Priority.MEDIUM;
    }
}
