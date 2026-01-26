package com.karina.gestione_magazzino.controller;

import com.karina.gestione_magazzino.model.Prodotto;
import com.karina.gestione_magazzino.service.ProdottoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prodotti")
public class ProdottoController {

    @Autowired
    private ProdottoService service;

    @GetMapping
    public List <Prodotto> getAll() {
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
        return service.save(prodotto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prodotto> update(@PathVariable Long id, @RequestBody Prodotto prodotto) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        prodotto.setId(id);
        return ResponseEntity.ok(service.save(prodotto));
    }

    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
