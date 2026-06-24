import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';

/**
 * usePriceFeed — Fetches live ETH prices from the backend (CoinGecko cached).
 * Polls every 30 seconds. Falls back to last known values on error.
 *
 * Returns: { ethUsd, ethEur, ethInr, loading, lastUpdated, currency, setCurrency }
 */
export const usePriceFeed = () => {
  const [prices, setPrices] = useState({ usd: 2890.50, eur: 2650.30, inr: 240500.00 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('preferred_currency') || 'usd'
  );

  const fetchPrices = useCallback(async () => {
    try {
      const response = await api.get('/api/prices/eth');
      if (response.data) {
        setPrices({
          usd: response.data.usd || prices.usd,
          eur: response.data.eur || prices.eur,
          inr: response.data.inr || prices.inr,
        });
        if (response.data.lastUpdated) {
          setLastUpdated(new Date(response.data.lastUpdated));
        }
      }
    } catch {
      // Silent — keep cached values
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Persist currency preference
  const setAndSaveCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('preferred_currency', c);
  };

  return {
    ethUsd: prices.usd,
    ethEur: prices.eur,
    ethInr: prices.inr,
    currentPrice: prices[currency] || prices.usd,
    loading,
    lastUpdated,
    currency,
    setCurrency: setAndSaveCurrency,
    refresh: fetchPrices,
  };
};
