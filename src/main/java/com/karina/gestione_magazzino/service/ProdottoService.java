package com.karina.gestione_magazzino.service;

import com.karina.gestione_magazzino.model.Prodotto;
import com.karina.gestione_magazzino.repository.ProdottoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdottoService {

    @Autowired
    private ProdottoRepository repository;

    public List<Prodotto> findAll() {
        return repository.findAll();
    }

    public Optional<Prodotto> findById(Long id) {
        return repository.findById(id);
    }

    public Prodotto save(Prodotto prodotto) {
        return repository.save(prodotto);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
