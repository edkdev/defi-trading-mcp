// src/services/coinGeckoApiService.js
import fetch from 'node-fetch';

export class CoinGeckoApiService {
  constructor(apiKey) {
    this.baseUrl = 'https://api.coingecko.com/api/v3/onchain';
    this.apiKey = apiKey;
    // Determine API key type based on key format
    // Pro API keys are typically longer and use different header
    this.apiKeyHeader = this.detectApiKeyType(apiKey);
  }

  /**
   * Detects whether the API key is a demo or pro key
   * Demo keys use 'x-cg-demo-api-key' header
   * Pro keys use 'x-cg-pro-api-key' header
   * @param {string} apiKey - The CoinGecko API key
   * @returns {string} The appropriate header name
   */
  detectApiKeyType(apiKey) {
    if (!apiKey) return 'x-cg-demo-api-key';
    
    // Pro API keys are typically 32+ characters and alphanumeric
    // Demo keys are typically shorter (around 20-30 chars)
    // This is a heuristic - users can override if needed
    const isProKey = apiKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(apiKey);
    
    return isProKey ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key';
  }

  /**
   * Gets the headers for CoinGecko API requests
   * @returns {Object} Headers object with appropriate API key header
   */
  getHeaders() {
    const headers = {};
    if (this.apiKey) {
      headers[this.apiKeyHeader] = this.apiKey;
    }
    return headers;
  }

  async getTokenPrice(network, addresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional parameters
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/simple/networks/${network}/token_price/${addresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }

  async getNetworks(page = 1) {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);

      const url = `${this.baseUrl}/networks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get networks: ${error.message}`);
    }
  }

  async getSupportedDexes(network) {
    try {
      const url = `${this.baseUrl}/networks/${network}/dexes`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get supported DEXes: ${error.message}`);
    }
  }

  async getTrendingPools(duration = '24h', options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (duration) queryParams.append('duration', duration);
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/trending_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get trending pools: ${error.message}`);
    }
  }

  async getTrendingPoolsByNetwork(network, duration = '24h', options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (duration) queryParams.append('duration', duration);
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/networks/${network}/trending_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get trending pools by network: ${error.message}`);
    }
  }

  async getMultiplePoolsData(poolAddresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional parameters
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/pools/${poolAddresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get multiple pools data: ${error.message}`);
    }
  }

  async getTopPoolsByDex(network, dex, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/networks/${network}/dexes/${dex}/pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get top pools by DEX: ${error.message}`);
    }
  }

  async getNewPools(network, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/networks/${network}/new_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get new pools: ${error.message}`);
    }
  }

  async searchPools(query, network, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', query);
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/networks/${network}/pools/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to search pools: ${error.message}`);
    }
  }

  async getTopPoolsByToken(network, tokenAddress, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/networks/${network}/tokens/${tokenAddress}/pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get top pools by token: ${error.message}`);
    }
  }

  async getTokenData(network, tokenAddress, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/networks/${network}/tokens/${tokenAddress}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token data: ${error.message}`);
    }
  }

  async getMultipleTokensData(network, tokenAddresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.include_market_cap) queryParams.append('include_market_cap', options.include_market_cap);
      if (options.mcap_fdv_fallback) queryParams.append('mcap_fdv_fallback', options.mcap_fdv_fallback);
      if (options.include_24hr_vol) queryParams.append('include_24hr_vol', options.include_24hr_vol);
      if (options.include_24hr_price_change) queryParams.append('include_24hr_price_change', options.include_24hr_price_change);
      if (options.include_total_reserve_in_usd) queryParams.append('include_total_reserve_in_usd', options.include_total_reserve_in_usd);

      const url = `${this.baseUrl}/networks/${network}/tokens/multi/${tokenAddresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get multiple tokens data: ${error.message}`);
    }
  }

  async getTokenInfo(network, tokenAddress) {
    try {
      const url = `${this.baseUrl}/networks/${network}/tokens/${tokenAddress}/info`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getRecentlyUpdatedTokens(network, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.duration) queryParams.append('duration', options.duration);

      const url = `${this.baseUrl}/networks/${network}/tokens/recently_updated${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get recently updated tokens: ${error.message}`);
    }
  }

  async getPoolOHLCV(network, poolAddress, timeframe, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('timeframe', timeframe);
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);

      const url = `${this.baseUrl}/networks/${network}/pools/${poolAddress}/ohlcv${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get pool OHLCV: ${error.message}`);
    }
  }

  async getPoolTrades(network, poolAddress, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.trade_volume_in_usd_greater_than) queryParams.append('trade_volume_in_usd_greater_than', options.trade_volume_in_usd_greater_than);

      const url = `${this.baseUrl}/networks/${network}/pools/${poolAddress}/trades${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get pool trades: ${error.message}`);
    }
  }
}
