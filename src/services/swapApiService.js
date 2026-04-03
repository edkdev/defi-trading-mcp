// src/services/swapApiService.js
import fetch from 'node-fetch';

const SWAPAPI_BASE_URL = "https://api.swapapi.dev";
const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export class SwapApiService {
  constructor(baseUrl = SWAPAPI_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get a swap quote from SwapAPI.
   * Maps the existing agService param conventions (buyToken, sellToken, sellAmount, taker)
   * to SwapAPI's format (tokenIn, tokenOut, amount, sender).
   */
  async getSwapQuote(params) {
    try {
      const { chainId, buyToken, sellToken, sellAmount, taker, slippageBps } = params;

      if (!chainId || !buyToken || !sellToken || !sellAmount) {
        throw new Error("Missing required parameters: chainId, buyToken, sellToken, sellAmount");
      }

      const queryParams = new URLSearchParams({
        tokenIn: sellToken,
        tokenOut: buyToken,
        amount: sellAmount,
      });

      if (taker) {
        queryParams.set("sender", taker);
      }

      // Convert slippageBps (basis points, e.g. 100 = 1%) to maxSlippage (decimal, e.g. 0.01)
      if (slippageBps !== undefined && slippageBps !== null) {
        const maxSlippage = Number(slippageBps) / 10000;
        queryParams.set("maxSlippage", maxSlippage.toString());
      }

      const url = `${this.baseUrl}/v1/swap/${chainId}?${queryParams}`;
      const response = await fetch(url);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.error?.message || data.error?.code || "API request failed";
        throw new Error(errorMsg);
      }

      // Normalize the response to match the shape that toolService expects
      return this._normalizeQuoteResponse(data.data, chainId);
    } catch (error) {
      throw new Error(`Failed to get swap quote from SwapAPI: ${error.message}`);
    }
  }

  /**
   * Get a swap price (indicative) from SwapAPI.
   * SwapAPI does not have a separate price endpoint, so we use the same
   * swap endpoint and strip the tx data.
   */
  async getSwapPrice(params) {
    try {
      const quote = await this.getSwapQuote(params);

      // Return price-only data (no tx object)
      const { transaction, ...priceData } = quote;
      return priceData;
    } catch (error) {
      throw new Error(`Failed to get swap price from SwapAPI: ${error.message}`);
    }
  }

  /**
   * SwapAPI returns ready-to-sign calldata directly in the quote response,
   * so "execute" just returns the tx for signing by blockchainService.
   * The toolService.executeSwap method handles the actual signing/broadcast.
   */
  async executeSwap(swapData) {
    // SwapAPI quotes already contain the tx object.
    // The caller (toolService) passes quoteData which already has `transaction`.
    if (!swapData || !swapData.transaction) {
      throw new Error("SwapAPI quote data with transaction is required for execution");
    }
    return swapData;
  }

  /**
   * Return the list of supported chains.
   * SwapAPI supports 46 EVM chains. We return a static list of the most common ones
   * plus a note that 46 chains are supported.
   */
  async getSupportedChains() {
    return {
      chains: [
        { id: 1, name: "Ethereum" },
        { id: 10, name: "Optimism" },
        { id: 56, name: "BSC" },
        { id: 137, name: "Polygon" },
        { id: 250, name: "Fantom" },
        { id: 324, name: "zkSync Era" },
        { id: 8453, name: "Base" },
        { id: 42161, name: "Arbitrum" },
        { id: 43114, name: "Avalanche" },
        { id: 59144, name: "Linea" },
        { id: 534352, name: "Scroll" },
        { id: 5000, name: "Mantle" },
        { id: 81457, name: "Blast" },
        { id: 34443, name: "Mode" },
        { id: 480, name: "Worldchain" },
        { id: 130, name: "Unichain" },
        { id: 80094, name: "Berachain" },
        { id: 57073, name: "Ink" },
      ],
      provider: "swapapi",
      note: "SwapAPI supports 46 EVM chains total. See https://swapapi.dev/llms.txt for the full list.",
    };
  }

  /**
   * getLiquiditySources is not supported by SwapAPI — it aggregates across
   * all available sources automatically.
   */
  async getLiquiditySources(chainId) {
    return {
      sources: [],
      provider: "swapapi",
      note: "SwapAPI automatically aggregates across all available liquidity sources for each chain.",
    };
  }

  /**
   * Normalize SwapAPI response to match the shape expected by toolService/blockchainService.
   */
  _normalizeQuoteResponse(swapApiData, chainId) {
    const result = {
      // Preserve original SwapAPI fields
      status: swapApiData.status,
      amountIn: swapApiData.amountIn,
      expectedAmountOut: swapApiData.expectedAmountOut,
      minAmountOut: swapApiData.minAmountOut,
      priceImpact: swapApiData.priceImpact,
      tokenFrom: swapApiData.tokenFrom,
      tokenTo: swapApiData.tokenTo,
      provider: "swapapi",
      chainId: chainId,
    };

    // Map SwapAPI's tx object to the `transaction` shape that blockchainService expects
    if (swapApiData.tx) {
      result.transaction = {
        to: swapApiData.tx.to,
        data: swapApiData.tx.data,
        value: swapApiData.tx.value || "0",
        from: swapApiData.tx.from,
        gasPrice: swapApiData.tx.gasPrice,
        // SwapAPI does not include gasLimit — caller must estimate
        gas: undefined,
      };
    }

    return result;
  }
}
