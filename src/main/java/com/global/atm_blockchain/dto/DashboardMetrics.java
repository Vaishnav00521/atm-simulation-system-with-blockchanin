package com.global.atm_blockchain.dto;

public class DashboardMetrics {
    private Double fiatBalance;
    private Double cryptoBalance;
    private String networkStatus;
    private Integer activeContracts;

    // Constructors
    public DashboardMetrics(Double fiatBalance, Double cryptoBalance, String networkStatus, Integer activeContracts) {
        this.fiatBalance = fiatBalance;
        this.cryptoBalance = cryptoBalance;
        this.networkStatus = networkStatus;
        this.activeContracts = activeContracts;
    }

    // Getters and Setters
    public Double getFiatBalance() { return fiatBalance; }
    public void setFiatBalance(Double fiatBalance) { this.fiatBalance = fiatBalance; }

    public Double getCryptoBalance() { return cryptoBalance; }
    public void setCryptoBalance(Double cryptoBalance) { this.cryptoBalance = cryptoBalance; }

    public String getNetworkStatus() { return networkStatus; }
    public void setNetworkStatus(String networkStatus) { this.networkStatus = networkStatus; }

    public Integer getActiveContracts() { return activeContracts; }
    public void setActiveContracts(Integer activeContracts) { this.activeContracts = activeContracts; }
}