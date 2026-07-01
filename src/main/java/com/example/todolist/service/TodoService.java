package com.example.todolist.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.example.todolist.exception.TodoNotFoundException;
import com.example.todolist.model.Todo;
import com.example.todolist.model.TodoRequest;

/**
 * In-memory store and business logic for todos.
 *
 * <p>Uses a {@link ConcurrentHashMap} so the service is thread-safe under the
 * concurrent requests a web server produces. No database is involved — all data
 * lives for the lifetime of the process.</p>
 */
@Service
public class TodoService {

    private final Map<Long, Todo> store = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    /** Returns all todos, newest first. */
    public List<Todo> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Todo::getCreatedAt).reversed())
                .toList();
    }

    public Todo findById(Long id) {
        Todo todo = store.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }
        return todo;
    }

    public Todo create(TodoRequest request) {
        long id = idSequence.incrementAndGet();
        Todo todo = new Todo(
                id,
                request.title().trim(),
                request.resolvedCompleted(),
                request.resolvedPriority(),
                Instant.now());
        store.put(id, todo);
        return todo;
    }

    public Todo update(Long id, TodoRequest request) {
        Todo todo = findById(id);
        todo.setTitle(request.title().trim());
        todo.setCompleted(request.resolvedCompleted());
        todo.setPriority(request.resolvedPriority());
        return todo;
    }

    /** Flips the completed flag and returns the updated todo. */
    public Todo toggle(Long id) {
        Todo todo = findById(id);
        todo.setCompleted(!todo.isCompleted());
        return todo;
    }

    public void delete(Long id) {
        if (store.remove(id) == null) {
            throw new TodoNotFoundException(id);
        }
    }

    /** Removes every completed todo and returns how many were removed. */
    public int clearCompleted() {
        int before = store.size();
        store.values().removeIf(Todo::isCompleted);
        return before - store.size();
    }
}
