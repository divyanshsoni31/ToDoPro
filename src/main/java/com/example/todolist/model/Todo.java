package com.example.todolist.model;

import java.time.Instant;

/**
 * A single todo item.
 *
 * <p>Held entirely in memory — no persistence layer is involved.</p>
 */
public class Todo {

    private Long id;
    private String title;
    private boolean completed;
    private Priority priority;
    private Instant createdAt;

    public Todo() {
    }

    public Todo(Long id, String title, boolean completed, Priority priority, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
