package com.karina.gestione_magazzino.model;

import jakarta.persistence.*;

@Entity
public class Prodotto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private int quantita;
    private double prezzo;
    private String categoria;
    private String descrizione;
    private String posizione;
    private String linkFornitore;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String fotoBase64;

    public Prodotto() {}

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}
    public String getNome() {return nome;}

    public void setNome(String nome) {this.nome = nome;}
    public int getQuantita() {return quantita;}

    public void setQuantita(int quantita) {this.quantita = quantita;}
    public double getPrezzo() {return prezzo;}

    public void setPrezzo(double prezzo) {this.prezzo = prezzo;}
    public String getCategoria() {return categoria;}

    public void setCategoria(String categoria) {this.categoria = categoria;}
    public String getDescrizione() {return descrizione;}

    public void setDescrizione(String descrizione) {this.descrizione = descrizione;}
    public String getPosizione() {return posizione;}

    public void setPosizione(String posizione) {this.posizione = posizione;}
    public String getLinkFornitore() {return linkFornitore;}

    public void setinkFornitore(String posizione) {this.linkFornitore = linkFornitore;}

    public String getFotoBase64() {return fotoBase64;}
    public void setFotoBase64(String fotoBase64) {this.fotoBase64 = fotoBase64;}
}

