package com.karina.gestione_magazzino.controller;

import com.karina.gestione_magazzino.model.Prodotto;
import com.karina.gestione_magazzino.repository.ProdottoRepository;
import com.karina.gestione_magazzino.service.ProdottoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
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

    private final String uploadDir = "uploads-magazzino/";  // RELATIVO alla root del progetto

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

    // CREA prodotto (senza foto per ora, o con FormData)
    @PostMapping
    public Prodotto create(@RequestBody Prodotto prodotto) {
        System.out.println("POST prodotto ricevuto: " + prodotto.getNome());
        return service.save(prodotto);
    }

    // PROXY per Hugging Face (chiamato dal frontend)
    @PostMapping("/proxy-hf")
    public ResponseEntity<String> proxyHF(@RequestBody Map<String, String> requestBody) {
        try {
            String model = requestBody.get("model");
            String inputs = requestBody.get("inputs");

            if (model == null || inputs == null) {
                return ResponseEntity.badRequest().body("Missing model or inputs");
            }

            String hfToken = "";  // ← TOKEN VALIDO

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + hfToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>("{\"inputs\": \"" + inputs + "\"}", headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> hfResponse = restTemplate.exchange(
                    "https://router.huggingface.co/models/" + model,  // ← CAMBIA QUI
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            return ResponseEntity.status(hfResponse.getStatusCode()).body(hfResponse.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Errore proxy: " + e.getMessage());
        }
    }

    // UPDATE prodotto
    @PutMapping("/{id}")
    public ResponseEntity<Prodotto> update(@PathVariable Long id, @RequestBody Prodotto prodotto) {
        Optional<Prodotto> existing = service.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        prodotto.setId(id);
        return ResponseEntity.ok(service.save(prodotto));
    }

    // DELETE prodotto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}