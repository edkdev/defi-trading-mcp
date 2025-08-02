// src/services/coinGeckoApiService.js
import fetch from 'node-fetch';

export class CoinGeckoApiService {
  constructor(apiKey) {
    this.baseUrl = 'https://api.coingecko.com/api/v3/onchain';
    this.apiKey = apiKey;
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
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
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
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get networks: ${error.message}`);
    }
  }

  async getSupportedDexes(network, page = 1) {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);

      const url = `${this.baseUrl}/networks/${network}/dexes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get supported DEXes: ${error.message}`);
    }
  }

  async getTrendingPools(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);
      if (options.duration) queryParams.append('duration', options.duration);

      const url = `${this.baseUrl}/networks/trending_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get trending pools: ${error.message}`);
    }
  }

  async getTrendingPoolsByNetwork(network, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);
      if (options.duration) queryParams.append('duration', options.duration);

      const url = `${this.baseUrl}/networks/${network}/trending_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get trending pools by network: ${error.message}`);
    }
  }

  async getMultiplePoolsData(network, addresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.include_volume_breakdown) queryParams.append('include_volume_breakdown', options.include_volume_breakdown);

      const url = `${this.baseUrl}/networks/${network}/pools/multi/${addresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
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
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);
      if (options.sort) queryParams.append('sort', options.sort);

      const url = `${this.baseUrl}/networks/${network}/dexes/${dex}/pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get top pools by DEX: ${error.message}`);
    }
  }

  async getNewPools(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/networks/new_pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get new pools: ${error.message}`);
    }
  }

  async searchPools(query, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (query) queryParams.append('query', query);
      if (options.network) queryParams.append('network', options.network);
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);

      const url = `${this.baseUrl}/search/pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to search pools: ${error.message}`);
    }
  }

  // Additional endpoints from coingeckoendpoints-2.txt
  async getTopPoolsByToken(network, tokenAddress, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.page) queryParams.append('page', options.page);
      if (options.sort) queryParams.append('sort', options.sort);

      const url = `${this.baseUrl}/networks/${network}/tokens/${tokenAddress}/pools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get top pools by token: ${error.message}`);
    }
  }

  async getTokenData(network, address, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);

      const url = `${this.baseUrl}/networks/${network}/tokens/${address}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token data: ${error.message}`);
    }
  }

  async getMultipleTokensData(network, addresses, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);

      const url = `${this.baseUrl}/networks/${network}/tokens/multi/${addresses}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get multiple tokens data: ${error.message}`);
    }
  }

  async getTokenInfo(network, address) {
    try {
      const url = `${this.baseUrl}/networks/${network}/tokens/${address}/info`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getRecentlyUpdatedTokens(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.include) queryParams.append('include', options.include);
      if (options.network) queryParams.append('network', options.network);

      const url = `${this.baseUrl}/tokens/info_recently_updated${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
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
      
      if (options.aggregate) queryParams.append('aggregate', options.aggregate);
      if (options.before_timestamp) queryParams.append('before_timestamp', options.before_timestamp);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.currency) queryParams.append('currency', options.currency);
      if (options.token) queryParams.append('token', options.token);
      if (options.include_empty_intervals) queryParams.append('include_empty_intervals', options.include_empty_intervals);

      const url = `${this.baseUrl}/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
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
      
      if (options.trade_volume_in_usd_greater_than) queryParams.append('trade_volume_in_usd_greater_than', options.trade_volume_in_usd_greater_than);

      const url = `${this.baseUrl}/networks/${network}/pools/${poolAddress}/trades${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': this.apiKey
        }
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