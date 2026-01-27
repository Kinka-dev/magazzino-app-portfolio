package com.karina.gestione_magazzino.controller;

import com.karina.gestione_magazzino.model.Prodotto;
import com.karina.gestione_magazzino.repository.ProdottoRepository;
import com.karina.gestione_magazzino.service.ProdottoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/prodotti")
@CrossOrigin(origins = {"http://localhost:8080", "http://192.168.0.170:8080", "*"})
public class ProdottoController {

    @Autowired
    private ProdottoService service;

    @Autowired
    private ProdottoRepository repository;

    private final String uploadDir = "uploads-magazzino/";

    @GetMapping
    public List<Prodotto> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prodotto> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Prodotto create(@RequestBody Prodotto prodotto) {
        System.out.println("POST prodotto ricevuto: " + prodotto.getNome());
        return service.save(prodotto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prodotto> update(@PathVariable Long id, @RequestBody Prodotto prodotto) {
        Optional<Prodotto> existing = service.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        prodotto.setId(id);
        return ResponseEntity.ok(service.save(prodotto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}