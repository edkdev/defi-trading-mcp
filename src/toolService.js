// src/toolService.js
import { AgService } from "./services/agService.js";
import { CoinGeckoApiService } from "./services/coinGeckoApiService.js";
import { BlockchainService } from "./services/blockchainService.js";
import { ethers } from "ethers";

export class ToolService {
  constructor(
    agUrl,
    userPrivateKey,
    userAddress,
    coinGeckoApiKey,
    alchemyApiKey
  ) {
    this.agg = new AgService(agUrl);
    this.coinGeckoApi = new CoinGeckoApiService(coinGeckoApiKey);
    this.blockchain = new BlockchainService(userPrivateKey, alchemyApiKey);
    this.userPrivateKey = userPrivateKey;
    this.userAddress = userAddress;
  }

  async getSwapPrice(params) {
    // Validate required parameters
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    const result = await this.agg.getSwapPrice(params);

    return {
      message: "Swap price retrieved successfully",
      data: result,
    };
  }

  async getSwapQuote(params) {
    // Validate required parameters
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    // Add taker address if not provided
    const quoteParams = {
      ...params,
      taker: params.taker || this.userAddress,
    };

    const result = await this.agg.getSwapQuote(quoteParams);

    // Add chainId to the result for executeSwap to use
    result.chainId = chainId;

    return {
      message: "Swap quote retrieved successfully",
      data: result,
      nextSteps: [
        "1. Review the quote details including fees and gas estimates",
        "2. Use execute_swap tool to execute this swap",
        "3. The permit2 signature will be handled automatically",
      ],
    };
  }

  async executeSwap(quoteData) {
    if (!quoteData) {
      throw new Error("Quote data is required for swap execution");
    }

    if (!this.userPrivateKey) {
      throw new Error("User private key is required for swap execution");
    }

    try {
      // Extract chain ID from quote data
      const chainId = quoteData.chainId || quoteData.transaction?.chainId;
      if (!chainId) {
        throw new Error("Chain ID not found in quote data");
      }

      console.log("🚀 Executing swap transaction...");

      // Sign and broadcast the transaction using blockchain service
      const result = await this.blockchain.signAndBroadcastTransaction(
        chainId,
        quoteData
      );

      return {
        message: "Swap executed successfully",
        data: result,
        nextSteps: [
          "1. Transaction has been broadcasted to the blockchain",
          "2. Wait for confirmation (usually 1-3 minutes)",
          "3. Check transaction status on block explorer",
          `4. Transaction hash: ${result.hash}`,
        ],
      };
    } catch (error) {
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  async getSupportedChains() {
    const result = await this.agg.getSupportedChains();

    return {
      message: "Supported chains retrieved successfully",
      data: result,
      summary: `Found ${result.chains?.length || 0} supported chains`,
    };
  }

  async getLiquiditySources(chainId) {
    if (!chainId) {
      throw new Error("chainId is required");
    }

    const result = await this.agg.getLiquiditySources(chainId);

    return {
      message: `Liquidity sources for chain ${chainId} retrieved successfully`,
      data: result,
      summary: `Found ${result.sources?.length || 0} liquidity sources`,
    };
  }

  // CoinGecko API Methods
  async getTokenPrice(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getTokenPrice(
      network,
      addresses,
      options
    );

    return {
      message: "Token prices retrieved successfully",
      data: result,
      summary: `Retrieved prices for ${
        addresses.split(",").length
      } token(s) on ${network} network`,
    };
  }

  async getCoinGeckoNetworks(page = 1) {
    const result = await this.coinGeckoApi.getNetworks(page);

    return {
      message: "CoinGecko networks retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} networks on page ${page}`,
    };
  }

  async getSupportedDexes(network, page = 1) {
    if (!network) {
      throw new Error("network is required");
    }

    const result = await this.coinGeckoApi.getSupportedDexes(network, page);

    return {
      message: `Supported DEXes for ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} DEXes on ${network} network`,
    };
  }

  async getTrendingPools(options = {}) {
    const result = await this.coinGeckoApi.getTrendingPools(options);

    return {
      message: "Trending pools retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} trending pools`,
      duration: options.duration || "24h",
    };
  }

  async getTrendingPoolsByNetwork(network, options = {}) {
    if (!network) {
      throw new Error("network is required");
    }

    const result = await this.coinGeckoApi.getTrendingPoolsByNetwork(
      network,
      options
    );

    return {
      message: `Trending pools for ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} trending pools on ${network}`,
      duration: options.duration || "24h",
    };
  }

  async getMultiplePoolsData(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getMultiplePoolsData(
      network,
      addresses,
      options
    );

    return {
      message: "Multiple pools data retrieved successfully",
      data: result,
      summary: `Retrieved data for ${
        addresses.split(",").length
      } pool(s) on ${network}`,
    };
  }

  async getTopPoolsByDex(network, dex, options = {}) {
    if (!network || !dex) {
      throw new Error("Missing required parameters: network, dex");
    }

    const result = await this.coinGeckoApi.getTopPoolsByDex(
      network,
      dex,
      options
    );

    return {
      message: `Top pools for ${dex} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} pools on ${dex}`,
      sort: options.sort || "h24_tx_count_desc",
    };
  }

  async getNewPools(options = {}) {
    const result = await this.coinGeckoApi.getNewPools(options);

    return {
      message: "New pools retrieved successfully",
      data: result,
      summary: `Found ${
        result.data?.length || 0
      } new pools across all networks`,
    };
  }

  async searchPools(query, options = {}) {
    if (!query) {
      throw new Error("query is required");
    }

    const result = await this.coinGeckoApi.searchPools(query, options);

    return {
      message: `Pool search for "${query}" completed successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} pools matching "${query}"${
        options.network ? ` on ${options.network}` : ""
      }`,
    };
  }

  // Additional CoinGecko API Methods from coingeckoendpoints-2.txt
  async getTopPoolsByToken(network, tokenAddress, options = {}) {
    if (!network || !tokenAddress) {
      throw new Error("Missing required parameters: network, tokenAddress");
    }

    const result = await this.coinGeckoApi.getTopPoolsByToken(
      network,
      tokenAddress,
      options
    );

    return {
      message: `Top pools for token ${tokenAddress} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${
        result.data?.length || 0
      } pools for token ${tokenAddress}`,
      sort: options.sort || "h24_volume_usd_liquidity_desc",
    };
  }

  async getTokenData(network, address, options = {}) {
    if (!network || !address) {
      throw new Error("Missing required parameters: network, address");
    }

    const result = await this.coinGeckoApi.getTokenData(
      network,
      address,
      options
    );

    return {
      message: `Token data for ${address} on ${network} retrieved successfully`,
      data: result,
      summary: `Retrieved data for token ${
        result.data?.attributes?.symbol || address
      }`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getMultipleTokensData(network, addresses, options = {}) {
    if (!network || !addresses) {
      throw new Error("Missing required parameters: network, addresses");
    }

    const result = await this.coinGeckoApi.getMultipleTokensData(
      network,
      addresses,
      options
    );

    return {
      message: "Multiple tokens data retrieved successfully",
      data: result,
      summary: `Retrieved data for ${
        addresses.split(",").length
      } token(s) on ${network}`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getTokenInfo(network, address) {
    if (!network || !address) {
      throw new Error("Missing required parameters: network, address");
    }

    const result = await this.coinGeckoApi.getTokenInfo(network, address);

    return {
      message: `Token info for ${address} on ${network} retrieved successfully`,
      data: result,
      summary: `Retrieved detailed info for token ${
        result.data?.attributes?.symbol || address
      }`,
      note: "This endpoint provides additional token information like socials, websites, and description",
    };
  }

  async getRecentlyUpdatedTokens(options = {}) {
    const result = await this.coinGeckoApi.getRecentlyUpdatedTokens(options);

    return {
      message: "Recently updated tokens retrieved successfully",
      data: result,
      summary: `Found ${result.data?.length || 0} recently updated tokens${
        options.network ? ` on ${options.network}` : " across all networks"
      }`,
      includes: options.include ? options.include.split(",") : [],
    };
  }

  async getPoolOHLCV(network, poolAddress, timeframe, options = {}) {
    if (!network || !poolAddress || !timeframe) {
      throw new Error(
        "Missing required parameters: network, poolAddress, timeframe"
      );
    }

    const result = await this.coinGeckoApi.getPoolOHLCV(
      network,
      poolAddress,
      timeframe,
      options
    );

    return {
      message: `OHLCV data for pool ${poolAddress} retrieved successfully`,
      data: result,
      summary: `Retrieved ${timeframe} OHLCV data for pool on ${network}`,
      timeframe: timeframe,
      aggregate: options.aggregate || "1",
      currency: options.currency || "usd",
      token: options.token || "base",
    };
  }

  async getPoolTrades(network, poolAddress, options = {}) {
    if (!network || !poolAddress) {
      throw new Error("Missing required parameters: network, poolAddress");
    }

    const result = await this.coinGeckoApi.getPoolTrades(
      network,
      poolAddress,
      options
    );

    return {
      message: `Pool trades for ${poolAddress} on ${network} retrieved successfully`,
      data: result,
      summary: `Found ${result.data?.length || 0} trades for pool`,
      minVolumeFilter: options.trade_volume_in_usd_greater_than || "none",
    };
  }

  // Gasless Aggregator API Methods
  async getGaslessPrice(params) {
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    const result = await this.agg.getGaslessPrice(params);

    return {
      message: "Gasless swap price retrieved successfully",
      data: result,
      note: "This is a gasless swap - no ETH needed for gas fees",
    };
  }

  async getGaslessQuote(params) {
    const { chainId, buyToken, sellToken, sellAmount } = params;

    if (!chainId || !buyToken || !sellToken || !sellAmount) {
      throw new Error(
        "Missing required parameters: chainId, buyToken, sellToken, sellAmount"
      );
    }

    // Add taker address if not provided (required for gasless quotes)
    const quoteParams = {
      ...params,
      taker: params.taker || this.userAddress,
    };

    if (!quoteParams.taker) {
      throw new Error("Taker address is required for gasless quotes");
    }

    const result = await this.agg.getGaslessQuote(quoteParams);

    return {
      message: "Gasless swap quote retrieved successfully",
      data: result,
      nextSteps: [
        "1. Review the quote details including approval and trade objects",
        "2. Use submit_gasless_swap tool to execute this gasless swap",
        "3. Both approval and trade signatures will be handled automatically",
      ],
      gaslessInfo: {
        hasApproval: !!result.approval,
        hasTrade: !!result.trade,
        approvalType: result.approval?.type,
        tradeType: result.trade?.type,
      },
    };
  }

  async submitGaslessSwap(params) {
    const { quoteData } = params;

    if (!quoteData) {
      throw new Error("Quote data from gasless quote is required");
    }

    if (!this.userPrivateKey) {
      throw new Error(
        "User private key is required for gasless swap execution"
      );
    }

    try {
      console.log("🚀 Processing gasless swap...");

      // Prepare the submission data - extract chainId from trade domain
      const chainId =
        quoteData.trade?.eip712?.domain?.chainId || params.chainId;
      if (!chainId) {
        throw new Error("Chain ID not found in quote data or parameters");
      }

      const submissionData = {
        chainId: chainId,
      };

      // Sign approval if present
      if (quoteData.approval) {
        console.log("🔐 Signing gasless approval...");
        const signedApproval = await this.blockchain.signGaslessApproval(
          quoteData.approval
        );
        submissionData.approval = signedApproval;
        console.log("✅ Approval signed");
      }

      // Sign trade (always required)
      if (!quoteData.trade) {
        throw new Error("Trade data is required in gasless quote");
      }

      console.log("🔐 Signing gasless trade...");
      const signedTrade = await this.blockchain.signGaslessTrade(
        quoteData.trade
      );
      submissionData.trade = signedTrade;
      console.log("✅ Trade signed");

      // Submit to Aggregator gasless API
      console.log("📤 Submitting gasless swap to Agg...");
      const result = await this.agg.submitGaslessSwap(submissionData);

      return {
        message: "Gasless swap submitted successfully",
        data: result,
        nextSteps: [
          "1. Gasless swap has been submitted to relayer",
          "2. Monitor status using get_gasless_status tool",
          "3. No gas fees required - relayer handles execution",
          `4. Trade hash: ${result.tradeHash}`,
        ],
        gaslessInfo: {
          tradeHash: result.tradeHash,
          approvalSigned: !!submissionData.approval,
          tradeSigned: !!submissionData.trade,
          relayerHandled: true,
        },
      };
    } catch (error) {
      throw new Error(`Gasless swap submission failed: ${error.message}`);
    }
  }

  async getGaslessStatus(params) {
    const { tradeHash, chainId } = params;

    if (!tradeHash || !chainId) {
      throw new Error("Missing required parameters: tradeHash, chainId");
    }

    const result = await this.agg.getGaslessStatus(tradeHash, chainId);

    return {
      message: `Gasless swap status for ${tradeHash} retrieved successfully`,
      data: result,
      summary: `Status: ${result.status || "unknown"}`,
      gaslessInfo: {
        tradeHash,
        chainId,
        isGasless: true,
        relayerManaged: true,
      },
    };
  }

  async getGaslessChains() {
    const result = await this.agg.getGaslessChains();

    return {
      message: "Gasless supported chains retrieved successfully",
      data: result,
      summary: `Found ${
        result.chains?.length || 0
      } chains supporting gasless swaps`,
      note: "These chains support meta-transaction based gasless swaps",
    };
  }

  async getGaslessApprovalTokens(params = {}) {
    // Default to Base chain if no chainId provided
    const chainId = params.chainId || 8453;

    const result = await this.agg.getGaslessApprovalTokens(chainId);

    return {
      message: "Gasless approval tokens retrieved successfully",
      data: result,
      summary: `Found ${
        result.tokens?.length || 0
      } tokens supporting gasless approvals on chain ${chainId}`,
      note: "These tokens support EIP-2612 permit or meta-transaction approvals",
      chainId,
    };
  }

  // Portfolio API Methods
  async getPortfolioTokens(params) {
    const {
      addresses,
      withMetadata,
      withPrices,
      includeNativeTokens,
      networks,
    } = params;

    // Use provided addresses or default to USER_ADDRESS with specified networks
    let targetAddresses;
    if (addresses && Array.isArray(addresses)) {
      targetAddresses = addresses;
    } else if (this.userAddress) {
      // Default to USER_ADDRESS with provided networks or common networks
      const defaultNetworks = networks || ["eth-mainnet", "base-mainnet"];
      targetAddresses = [
        {
          address: this.userAddress,
          networks: defaultNetworks,
        },
      ];
    } else {
      throw new Error(
        "Either addresses parameter or USER_ADDRESS environment variable is required"
      );
    }

    const result = await this.agg.getPortfolioTokens(targetAddresses, {
      withMetadata,
      withPrices,
      includeNativeTokens,
    });

    return {
      message: "Portfolio tokens retrieved successfully",
      data: result,
      summary: `Retrieved tokens for ${
        targetAddresses.length
      } address(es) across ${targetAddresses.reduce(
        (total, addr) => total + addr.networks.length,
        0
      )} network(s)`,
      addressUsed: targetAddresses[0].address,
      options: {
        withMetadata: withMetadata !== false,
        withPrices: withPrices !== false,
        includeNativeTokens: includeNativeTokens || false,
      },
    };
  }

  async getPortfolioBalances(params) {
    const { addresses, includeNativeTokens, networks } = params;

    // Use provided addresses or default to USER_ADDRESS with specified networks
    let targetAddresses;
    if (addresses && Array.isArray(addresses)) {
      targetAddresses = addresses;
    } else if (this.userAddress) {
      // Default to USER_ADDRESS with provided networks or common networks
      const defaultNetworks = networks || ["eth-mainnet", "base-mainnet"];
      targetAddresses = [
        {
          address: this.userAddress,
          networks: defaultNetworks,
        },
      ];
    } else {
      throw new Error(
        "Either addresses parameter or USER_ADDRESS environment variable is required"
      );
    }

    const result = await this.agg.getPortfolioBalances(targetAddresses, {
      includeNativeTokens,
    });

    return {
      message: "Portfolio balances retrieved successfully",
      data: result,
      summary: `Retrieved balances for ${
        targetAddresses.length
      } address(es) across ${targetAddresses.reduce(
        (total, addr) => total + addr.networks.length,
        0
      )} network(s)`,
      addressUsed: targetAddresses[0].address,
      note: "Balances only - no prices or metadata for faster response",
      options: {
        includeNativeTokens: includeNativeTokens || false,
      },
    };
  }

  async getPortfolioTransactions(params) {
    const { addresses, before, after, limit, networks } = params;

    // Use provided addresses or default to USER_ADDRESS with specified networks
    let targetAddresses;
    if (addresses && Array.isArray(addresses)) {
      targetAddresses = addresses;
    } else if (this.userAddress) {
      // Default to USER_ADDRESS with provided networks or BETA supported networks
      const defaultNetworks = networks || ["eth-mainnet", "base-mainnet"];
      targetAddresses = [
        {
          address: this.userAddress,
          networks: defaultNetworks,
        },
      ];
    } else {
      throw new Error(
        "Either addresses parameter or USER_ADDRESS environment variable is required"
      );
    }

    if (targetAddresses.length !== 1) {
      throw new Error(
        "Transactions API currently supports only 1 address (BETA limitation)"
      );
    }

    const result = await this.agg.getPortfolioTransactions(targetAddresses, {
      before,
      after,
      limit,
    });

    return {
      message: "Portfolio transactions retrieved successfully",
      data: result,
      summary: `Retrieved ${
        result.transactions?.length || 0
      } transactions for address ${targetAddresses[0].address}`,
      addressUsed: targetAddresses[0].address,
      pagination: {
        limit: limit || 25,
        before: result.before,
        after: result.after,
        totalCount: result.totalCount,
      },
      beta: {
        limitations:
          "Currently supports 1 address and max 2 networks (eth-mainnet, base-mainnet)",
        note: "This endpoint is in BETA with limited functionality",
      },
    };
  }

  // Conversion utility methods
  async convertWeiToFormatted(params) {
    const { amount, decimals } = params;

    if (!amount) {
      throw new Error("amount is required");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    try {
      // Convert the amount to a BigNumber and format it
      const formattedAmount = ethers.formatUnits(amount.toString(), decimals);

      return {
        message: "Wei to formatted conversion completed successfully",
        data: {
          originalAmount: amount.toString(),
          decimals: decimals,
          formattedAmount: formattedAmount,
          unit: decimals === 18 ? "ETH" : `${decimals} decimals`,
        },
        summary: `Converted ${amount} wei to ${formattedAmount} (${decimals} decimals)`,
      };
    } catch (error) {
      throw new Error(`Wei to formatted conversion failed: ${error.message}`);
    }
  }

  async convertFormattedToWei(params) {
    const { amount, decimals } = params;

    if (!amount) {
      throw new Error("amount is required");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    try {
      // Convert the formatted amount to wei (BigNumber)
      const weiAmount = ethers.parseUnits(amount.toString(), decimals);

      return {
        message: "Formatted to wei conversion completed successfully",
        data: {
          originalAmount: amount.toString(),
          decimals: decimals,
          weiAmount: weiAmount.toString(),
          unit: decimals === 18 ? "ETH" : `${decimals} decimals`,
        },
        summary: `Converted ${amount} (${decimals} decimals) to ${weiAmount.toString()} wei`,
      };
    } catch (error) {
      throw new Error(`Formatted to wei conversion failed: ${error.message}`);
    }
  }
}
