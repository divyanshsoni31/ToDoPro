package com.example.todolist.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todolist.model.Todo;
import com.example.todolist.model.TodoRequest;
import com.example.todolist.service.TodoService;

/**
 * REST API for todos.
 *
 * <p>Endpoints:</p>
 * <ul>
 *   <li>{@code GET    /api/todos}            list all</li>
 *   <li>{@code POST   /api/todos}            create</li>
 *   <li>{@code PUT    /api/todos/{id}}       replace</li>
 *   <li>{@code PATCH  /api/todos/{id}/toggle} flip completed</li>
 *   <li>{@code DELETE /api/todos/{id}}       delete one</li>
 *   <li>{@code DELETE /api/todos/completed}  delete all completed</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Todo> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Todo get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Todo> create(@Valid @RequestBody TodoRequest request) {
        Todo created = service.create(request);
        return ResponseEntity
                .created(URI.create("/api/todos/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    public Todo update(@PathVariable Long id, @Valid @RequestBody TodoRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/toggle")
    public Todo toggle(@PathVariable Long id) {
        return service.toggle(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/completed")
    public Map<String, Integer> clearCompleted() {
        return Map.of("removed", service.clearCompleted());
    }
}
