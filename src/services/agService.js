// src/services/agService.js
import fetch from 'node-fetch';

export class AgService {
  constructor(agUrl) {
    this.baseUrl = agUrl;
  }

  async getSwapPrice(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/price?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get swap price: ${error.message}`);
    }
  }

  async getSwapQuote(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/quote?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  async executeSwap(swapData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swapData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Swap execution failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }

  async getSupportedChains() {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/chains`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get supported chains: ${error.message}`);
    }
  }

  async getLiquiditySources(chainId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/sources?chainId=${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get liquidity sources: ${error.message}`);
    }
  }

  // Gasless API Methods
  async getGaslessPrice(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/price?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless price request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get gasless price: ${error.message}`);
    }
  }

  async getGaslessQuote(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/quote?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless quote request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get gasless quote: ${error.message}`);
    }
  }

  async submitGaslessSwap(swapData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swapData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless swap submission failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to submit gasless swap: ${error.message}`);
    }
  }

  async getGaslessStatus(tradeHash, chainId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/status/${tradeHash}?chainId=${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless status request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get gasless status: ${error.message}`);
    }
  }

  async getGaslessChains() {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/chains`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless chains request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get gasless chains: ${error.message}`);
    }
  }

  async getGaslessApprovalTokens(chainId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/gasless/approval-tokens?chainId=${chainId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gasless approval tokens request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get gasless approval tokens: ${error.message}`);
    }
  }

  // Portfolio API Methods
  async getPortfolioTokens(addresses, options = {}) {
    try {
      const requestBody = {
        addresses,
        withMetadata: options.withMetadata,
        withPrices: options.withPrices,
        includeNativeTokens: options.includeNativeTokens
      };

      const response = await fetch(`${this.baseUrl}/api/portfolio/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Portfolio tokens request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get portfolio tokens: ${error.message}`);
    }
  }

  async getPortfolioBalances(addresses, options = {}) {
    try {
      const requestBody = {
        addresses,
        includeNativeTokens: options.includeNativeTokens
      };

      const response = await fetch(`${this.baseUrl}/api/portfolio/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Portfolio balances request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get portfolio balances: ${error.message}`);
    }
  }

  async getPortfolioTransactions(addresses, options = {}) {
    try {
      const requestBody = {
        addresses,
        before: options.before,
        after: options.after,
        limit: options.limit
      };

      // Remove undefined values
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      const response = await fetch(`${this.baseUrl}/api/portfolio/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Portfolio transactions request failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Failed to get portfolio transactions: ${error.message}`);
    }
  }
}