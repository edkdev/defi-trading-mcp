#!/usr/bin/env node
// src/index.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_NAMES, AGGREGATOR_SERVER_URL } from "./constants.js";
import { ToolService } from "./toolService.js";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import os from "os";
import "dotenv/config";

// Handle command line arguments
const args = process.argv.slice(2);

// Check for wallet creation command
if (args.includes("--create-wallet")) {
  console.log("🔐 Creating new Ethereum wallet...\n");

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ Wallet created successfully!\n");
  console.log("📋 Your Wallet Details:");
  console.log("=".repeat(50));
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Wallet Address: ${wallet.address}`);
  console.log("=".repeat(50));
  console.log("\n🔒 SECURITY WARNINGS:");
  console.log("• Keep your private key SECRET and SECURE");
  console.log("• Never share your private key with anyone");
  console.log("• Store it in a secure password manager");
  console.log("• This wallet has NO FUNDS - you need to deposit crypto");
  console.log("\n💡 Next Steps:");
  console.log("1. Copy the private key and wallet address above");
  console.log("2. Update your MCP configuration with these values");
  console.log("3. Send some ETH/tokens to your new wallet address");
  console.log("4. Start trading with your DeFi Trading Agent!");
  console.log("\n📚 For Claude Code users:");
  console.log("Run these commands to update your configuration, for other clients just update your config with the new address and private key:");
  console.log("claude mcp remove defi-trading");
  console.log(`claude mcp add defi-trading \\`);
  console.log(`  -e USER_PRIVATE_KEY=${wallet.privateKey} \\`);
  console.log(`  -e USER_ADDRESS=${wallet.address} \\`);
  console.log(`  -e COINGECKO_API_KEY=your_coingecko_api_key \\`);
  console.log(`  -e ALCHEMY_API_KEY=your_alchemy_api_key \\`);
  console.log(`  -- npx defi-trading-mcp`);

  process.exit(0);
}

// Load environment variables 
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
const USER_ADDRESS = process.env.USER_ADDRESS;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Initialize tool service with environment variables
const toolService = new ToolService(
  AGGREGATOR_SERVER_URL,
  USER_PRIVATE_KEY,
  USER_ADDRESS,
  COINGECKO_API_KEY,
  ALCHEMY_API_KEY
);

const server = new Server(
  {
    name: "Defi-trading-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: TOOL_NAMES.GET_SWAP_PRICE,
        description:
          "Get indicative price for a token swap using Aggregator Protocol",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description: "Blockchain ID (e.g., 1 for Ethereum)",
            },
            buyToken: {
              type: "string",
              description: "Contract address of token to buy",
            },
            sellToken: {
              type: "string",
              description: "Contract address of token to sell",
            },
            sellAmount: {
              type: "string",
              description: "Amount of sellToken in base units",
            },
            taker: {
              type: "string",
              description: "Address executing the trade (optional)",
            },
          },
          required: ["chainId", "buyToken", "sellToken", "sellAmount"],
        },
      },
      {
        name: TOOL_NAMES.GET_SWAP_QUOTE,
        description:
          "Get executable quote with transaction data for a token swap",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description: "Blockchain ID (e.g., 1 for Ethereum)",
            },
            buyToken: {
              type: "string",
              description: "Contract address of token to buy",
            },
            sellToken: {
              type: "string",
              description: "Contract address of token to sell",
            },
            sellAmount: {
              type: "string",
              description: "Amount of sellToken in base units",
            },
            taker: {
              type: "string",
              description:
                "Address executing the trade (optional, uses USER_ADDRESS from env)",
            },
            slippageBps: {
              type: "integer",
              description:
                "Maximum acceptable slippage in basis points (optional, default: 100)",
            },
          },
          required: ["chainId", "buyToken", "sellToken", "sellAmount"],
        },
      },
      {
        name: TOOL_NAMES.EXECUTE_SWAP,
        description: "Execute a swap transaction (requires quote data)",
        inputSchema: {
          type: "object",
          properties: {
            quoteData: {
              type: "object",
              description: "Quote data from get_swap_quote",
            },
          },
          required: ["quoteData"],
        },
      },
      {
        name: TOOL_NAMES.GET_SUPPORTED_CHAINS,
        description:
          "Get list of blockchain networks supported by Aggregator Protocol",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_LIQUIDITY_SOURCES,
        description:
          "Get list of liquidity sources available on a specific chain",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description: "Blockchain ID to get sources for",
            },
          },
          required: ["chainId"],
        },
      },
      {
        name: TOOL_NAMES.GET_TOKEN_PRICE,
        description:
          "Get token prices by contract addresses using CoinGecko API",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            addresses: {
              type: "string",
              description:
                "Token contract addresses, comma-separated for multiple tokens",
            },
            include_market_cap: {
              type: "boolean",
              description: "Include market capitalization (optional)",
            },
            mcap_fdv_fallback: {
              type: "boolean",
              description:
                "Return FDV if market cap is not available (optional)",
            },
            include_24hr_vol: {
              type: "boolean",
              description: "Include 24hr volume (optional)",
            },
            include_24hr_price_change: {
              type: "boolean",
              description: "Include 24hr price change (optional)",
            },
            include_total_reserve_in_usd: {
              type: "boolean",
              description: "Include total reserve in USD (optional)",
            },
          },
          required: ["network", "addresses"],
        },
      },
      {
        name: TOOL_NAMES.GET_COINGECKO_NETWORKS,
        description:
          "Get list of supported networks on CoinGecko/GeckoTerminal",
        inputSchema: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
          },
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_SUPPORTED_DEXES,
        description: "Get list of supported DEXes on a specific network",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
          },
          required: ["network"],
        },
      },
      {
        name: TOOL_NAMES.GET_TRENDING_POOLS,
        description: "Get trending pools across all networks on GeckoTerminal",
        inputSchema: {
          type: "object",
          properties: {
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex', 'network' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
            duration: {
              type: "string",
              description:
                "Duration for trending: '5m', '1h', '6h', '24h' (optional, default: '24h')",
              enum: ["5m", "1h", "6h", "24h"],
            },
          },
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_TRENDING_POOLS_BY_NETWORK,
        description: "Get trending pools on a specific network",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
            duration: {
              type: "string",
              description:
                "Duration for trending: '5m', '1h', '6h', '24h' (optional, default: '24h')",
              enum: ["5m", "1h", "6h", "24h"],
            },
          },
          required: ["network"],
        },
      },
      {
        name: TOOL_NAMES.GET_MULTIPLE_POOLS_DATA,
        description: "Get data for multiple pools by their contract addresses",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            addresses: {
              type: "string",
              description:
                "Pool contract addresses, comma-separated for multiple pools",
            },
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex' (comma-separated)",
            },
            include_volume_breakdown: {
              type: "boolean",
              description:
                "Include volume breakdown (optional, default: false)",
            },
          },
          required: ["network", "addresses"],
        },
      },
      {
        name: TOOL_NAMES.GET_TOP_POOLS_BY_DEX,
        description: "Get top pools on a specific DEX",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            dex: {
              type: "string",
              description: "DEX ID (e.g., 'uniswap_v3', 'sushiswap')",
            },
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
            sort: {
              type: "string",
              description:
                "Sort by: 'h24_tx_count_desc', 'h24_volume_usd_desc' (optional, default: 'h24_tx_count_desc')",
              enum: ["h24_tx_count_desc", "h24_volume_usd_desc"],
            },
          },
          required: ["network", "dex"],
        },
      },
      {
        name: TOOL_NAMES.GET_NEW_POOLS,
        description: "Get latest new pools across all networks",
        inputSchema: {
          type: "object",
          properties: {
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex', 'network' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
          },
          required: [],
        },
      },
      {
        name: TOOL_NAMES.SEARCH_POOLS,
        description:
          "Search for pools by query (pool address, token address, or token symbol)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Search query (pool address, token address, or token symbol)",
            },
            network: {
              type: "string",
              description:
                "Network ID to search on (optional, e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: TOOL_NAMES.GET_TOP_POOLS_BY_TOKEN,
        description: "Get top pools for a specific token by contract address",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            tokenAddress: {
              type: "string",
              description: "Token contract address",
            },
            include: {
              type: "string",
              description:
                "Attributes to include: 'base_token', 'quote_token', 'dex' (comma-separated)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination (optional, default: 1)",
            },
            sort: {
              type: "string",
              description:
                "Sort by: 'h24_volume_usd_liquidity_desc', 'h24_tx_count_desc', 'h24_volume_usd_desc' (optional, default: 'h24_volume_usd_liquidity_desc')",
              enum: [
                "h24_volume_usd_liquidity_desc",
                "h24_tx_count_desc",
                "h24_volume_usd_desc",
              ],
            },
          },
          required: ["network", "tokenAddress"],
        },
      },
      {
        name: TOOL_NAMES.GET_TOKEN_DATA,
        description: "Get specific token data by contract address",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            address: {
              type: "string",
              description: "Token contract address",
            },
            include: {
              type: "string",
              description: "Attributes to include: 'top_pools' (optional)",
              enum: ["top_pools"],
            },
          },
          required: ["network", "address"],
        },
      },
      {
        name: TOOL_NAMES.GET_MULTIPLE_TOKENS_DATA,
        description: "Get data for multiple tokens by their contract addresses",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            addresses: {
              type: "string",
              description:
                "Token contract addresses, comma-separated for multiple tokens",
            },
            include: {
              type: "string",
              description: "Attributes to include: 'top_pools' (optional)",
              enum: ["top_pools"],
            },
          },
          required: ["network", "addresses"],
        },
      },
      {
        name: TOOL_NAMES.GET_TOKEN_INFO,
        description:
          "Get detailed token information including socials, websites, and description",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            address: {
              type: "string",
              description: "Token contract address",
            },
          },
          required: ["network", "address"],
        },
      },
      {
        name: TOOL_NAMES.GET_RECENTLY_UPDATED_TOKENS,
        description: "Get recently updated tokens with their information",
        inputSchema: {
          type: "object",
          properties: {
            include: {
              type: "string",
              description: "Attributes to include: 'network' (optional)",
              enum: ["network"],
            },
            network: {
              type: "string",
              description:
                "Network ID to filter by (optional, e.g., 'eth', 'bsc', 'polygon_pos')",
            },
          },
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_POOL_OHLCV,
        description:
          "Get OHLCV (Open, High, Low, Close, Volume) data for a pool",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            poolAddress: {
              type: "string",
              description: "Pool contract address",
            },
            timeframe: {
              type: "string",
              description: "Timeframe for OHLCV data: 'day', 'hour', 'minute'",
              enum: ["day", "hour", "minute"],
            },
            aggregate: {
              type: "string",
              description: "Aggregate interval (optional, default: '1')",
            },
            before_timestamp: {
              type: "integer",
              description: "Get data before this timestamp (optional)",
            },
            limit: {
              type: "integer",
              description: "Limit number of results (optional, max: 1000)",
            },
            currency: {
              type: "string",
              description:
                "Currency for price data: 'usd', 'token' (optional, default: 'usd')",
              enum: ["usd", "token"],
            },
            token: {
              type: "string",
              description:
                "Token for price data: 'base', 'quote' (optional, default: 'base')",
              enum: ["base", "quote"],
            },
            include_empty_intervals: {
              type: "boolean",
              description: "Include empty intervals (optional, default: false)",
            },
          },
          required: ["network", "poolAddress", "timeframe"],
        },
      },
      {
        name: TOOL_NAMES.GET_POOL_TRADES,
        description: "Get recent trades for a specific pool",
        inputSchema: {
          type: "object",
          properties: {
            network: {
              type: "string",
              description: "Network ID (e.g., 'eth', 'bsc', 'polygon_pos')",
            },
            poolAddress: {
              type: "string",
              description: "Pool contract address",
            },
            trade_volume_in_usd_greater_than: {
              type: "number",
              description:
                "Filter trades with volume greater than this USD amount (optional)",
            },
          },
          required: ["network", "poolAddress"],
        },
      },
      {
        name: TOOL_NAMES.GET_GASLESS_PRICE,
        description:
          "Get indicative price for a gasless token swap (no gas fees required)",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description: "Blockchain ID (e.g., 8453 for Base)",
            },
            buyToken: {
              type: "string",
              description: "Contract address of token to buy",
            },
            sellToken: {
              type: "string",
              description: "Contract address of token to sell",
            },
            sellAmount: {
              type: "string",
              description: "Amount of sellToken in base units",
            },
            taker: {
              type: "string",
              description: "Address executing the trade (optional)",
            },
            slippageBps: {
              type: "integer",
              description:
                "Maximum acceptable slippage in basis points (optional, min: 30)",
            },
          },
          required: ["chainId", "buyToken", "sellToken", "sellAmount"],
        },
      },
      {
        name: TOOL_NAMES.GET_GASLESS_QUOTE,
        description:
          "Get executable quote for a gasless token swap with EIP-712 signature data",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description: "Blockchain ID (e.g., 8453 for Base)",
            },
            buyToken: {
              type: "string",
              description: "Contract address of token to buy",
            },
            sellToken: {
              type: "string",
              description: "Contract address of token to sell",
            },
            sellAmount: {
              type: "string",
              description: "Amount of sellToken in base units",
            },
            taker: {
              type: "string",
              description:
                "Address executing the trade (required for gasless quotes, uses USER_ADDRESS from env if not provided)",
            },
            slippageBps: {
              type: "integer",
              description:
                "Maximum acceptable slippage in basis points (optional, min: 30)",
            },
          },
          required: ["chainId", "buyToken", "sellToken", "sellAmount"],
        },
      },
      {
        name: TOOL_NAMES.SUBMIT_GASLESS_SWAP,
        description:
          "Submit a gasless swap by signing approval and trade messages (no gas fees required)",
        inputSchema: {
          type: "object",
          properties: {
            quoteData: {
              type: "object",
              description: "Quote data from get_gasless_quote",
            },
            chainId: {
              type: "integer",
              description: "Blockchain ID (optional if included in quoteData)",
            },
          },
          required: ["quoteData"],
        },
      },
      {
        name: TOOL_NAMES.GET_GASLESS_STATUS,
        description: "Get the status of a submitted gasless swap",
        inputSchema: {
          type: "object",
          properties: {
            tradeHash: {
              type: "string",
              description: "Trade hash from gasless swap submission",
            },
            chainId: {
              type: "integer",
              description: "Blockchain ID where the trade was submitted",
            },
          },
          required: ["tradeHash", "chainId"],
        },
      },
      {
        name: TOOL_NAMES.GET_GASLESS_CHAINS,
        description:
          "Get list of blockchain networks that support gasless swaps",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_GASLESS_APPROVAL_TOKENS,
        description:
          "Get list of tokens that support gasless approvals (EIP-2612 permit)",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "integer",
              description:
                "Blockchain ID (e.g., 8453 for Base, defaults to 8453 if not provided)",
            },
          },
          required: [],
        },
      },
      {
        name: TOOL_NAMES.GET_PORTFOLIO_TOKENS,
        description:
          "Get tokens with balances, prices, and metadata for multiple wallet addresses",
        inputSchema: {
          type: "object",
          properties: {
            addresses: {
              type: "array",
              description:
                "Array of address and networks pairs (max 3 addresses, max 20 networks each)",
              items: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    description: "Wallet address",
                  },
                  networks: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "Network identifiers (e.g., 'eth-mainnet', 'base-mainnet')",
                  },
                },
                required: ["address", "networks"],
              },
            },
            withMetadata: {
              type: "boolean",
              description: "Include token metadata (optional, default: true)",
            },
            withPrices: {
              type: "boolean",
              description: "Include token prices (optional, default: true)",
            },
            includeNativeTokens: {
              type: "boolean",
              description:
                "Include native tokens like ETH (optional, default: false)",
            },
          },
          required: ["addresses"],
        },
      },
      {
        name: TOOL_NAMES.GET_PORTFOLIO_BALANCES,
        description:
          "Get token balances for multiple wallet addresses (faster, no prices/metadata)",
        inputSchema: {
          type: "object",
          properties: {
            addresses: {
              type: "array",
              description:
                "Array of address and networks pairs (max 3 addresses, max 20 networks each)",
              items: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    description: "Wallet address",
                  },
                  networks: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "Network identifiers (e.g., 'eth-mainnet', 'base-mainnet')",
                  },
                },
                required: ["address", "networks"],
              },
            },
            includeNativeTokens: {
              type: "boolean",
              description:
                "Include native tokens like ETH (optional, default: false)",
            },
          },
          required: ["addresses"],
        },
      },
      {
        name: TOOL_NAMES.GET_PORTFOLIO_TRANSACTIONS,
        description:
          "Get transaction history for a wallet address (BETA: 1 address, ETH/BASE only)",
        inputSchema: {
          type: "object",
          properties: {
            addresses: {
              type: "array",
              description:
                "Array with single address and networks (BETA limitation: 1 address, max 2 networks)",
              items: {
                type: "object",
                properties: {
                  address: {
                    type: "string",
                    description: "Wallet address",
                  },
                  networks: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["eth-mainnet", "base-mainnet"],
                    },
                    description:
                      "Network identifiers (BETA: only eth-mainnet and base-mainnet supported)",
                  },
                },
                required: ["address", "networks"],
              },
              maxItems: 1,
            },
            before: {
              type: "string",
              description:
                "Cursor for pagination - get results before this cursor (optional)",
            },
            after: {
              type: "string",
              description:
                "Cursor for pagination - get results after this cursor (optional)",
            },
            limit: {
              type: "integer",
              description:
                "Number of transactions to return (optional, default: 25, max: 50)",
              minimum: 1,
              maximum: 50,
            },
          },
          required: ["addresses"],
        },
      },
      {
        name: TOOL_NAMES.CONVERT_WEI_TO_FORMATTED,
        description:
          "Convert wei amounts to human-readable format using ethers.js",
        inputSchema: {
          type: "object",
          properties: {
            amount: {
              type: "string",
              description: "Amount in wei (as string to handle large numbers)",
            },
            decimals: {
              type: "integer",
              description:
                "Number of decimal places for the token (e.g., 18 for ETH, 6 for USDC)",
            },
          },
          required: ["amount", "decimals"],
        },
      },
      {
        name: TOOL_NAMES.CONVERT_FORMATTED_TO_WEI,
        description: "Convert formatted amounts to wei using ethers.js",
        inputSchema: {
          type: "object",
          properties: {
            amount: {
              type: "string",
              description: "Formatted amount (e.g., '1.5' for 1.5 ETH)",
            },
            decimals: {
              type: "integer",
              description:
                "Number of decimal places for the token (e.g., 18 for ETH, 6 for USDC)",
            },
          },
          required: ["amount", "decimals"],
        },
      },
    ],
  };
});

// Set up tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case TOOL_NAMES.GET_SWAP_PRICE:
        result = await toolService.getSwapPrice(args);
        break;

      case TOOL_NAMES.GET_SWAP_QUOTE:
        result = await toolService.getSwapQuote(args);
        break;

      case TOOL_NAMES.EXECUTE_SWAP:
        result = await toolService.executeSwap(args.quoteData);
        break;

      case TOOL_NAMES.GET_SUPPORTED_CHAINS:
        result = await toolService.getSupportedChains();
        break;

      case TOOL_NAMES.GET_LIQUIDITY_SOURCES:
        result = await toolService.getLiquiditySources(args.chainId);
        break;

      case TOOL_NAMES.GET_TOKEN_PRICE:
        result = await toolService.getTokenPrice(args.network, args.addresses, {
          include_market_cap: args.include_market_cap,
          mcap_fdv_fallback: args.mcap_fdv_fallback,
          include_24hr_vol: args.include_24hr_vol,
          include_24hr_price_change: args.include_24hr_price_change,
          include_total_reserve_in_usd: args.include_total_reserve_in_usd,
        });
        break;

      case TOOL_NAMES.GET_COINGECKO_NETWORKS:
        result = await toolService.getCoinGeckoNetworks(args.page);
        break;

      case TOOL_NAMES.GET_SUPPORTED_DEXES:
        result = await toolService.getSupportedDexes(args.network, args.page);
        break;

      case TOOL_NAMES.GET_TRENDING_POOLS:
        result = await toolService.getTrendingPools({
          include: args.include,
          page: args.page,
          duration: args.duration,
        });
        break;

      case TOOL_NAMES.GET_TRENDING_POOLS_BY_NETWORK:
        result = await toolService.getTrendingPoolsByNetwork(args.network, {
          include: args.include,
          page: args.page,
          duration: args.duration,
        });
        break;

      case TOOL_NAMES.GET_MULTIPLE_POOLS_DATA:
        result = await toolService.getMultiplePoolsData(
          args.network,
          args.addresses,
          {
            include: args.include,
            include_volume_breakdown: args.include_volume_breakdown,
          }
        );
        break;

      case TOOL_NAMES.GET_TOP_POOLS_BY_DEX:
        result = await toolService.getTopPoolsByDex(args.network, args.dex, {
          include: args.include,
          page: args.page,
          sort: args.sort,
        });
        break;

      case TOOL_NAMES.GET_NEW_POOLS:
        result = await toolService.getNewPools({
          include: args.include,
          page: args.page,
        });
        break;

      case TOOL_NAMES.SEARCH_POOLS:
        result = await toolService.searchPools(args.query, {
          network: args.network,
          include: args.include,
          page: args.page,
        });
        break;

      case TOOL_NAMES.GET_TOP_POOLS_BY_TOKEN:
        result = await toolService.getTopPoolsByToken(
          args.network,
          args.tokenAddress,
          {
            include: args.include,
            page: args.page,
            sort: args.sort,
          }
        );
        break;

      case TOOL_NAMES.GET_TOKEN_DATA:
        result = await toolService.getTokenData(args.network, args.address, {
          include: args.include,
        });
        break;

      case TOOL_NAMES.GET_MULTIPLE_TOKENS_DATA:
        result = await toolService.getMultipleTokensData(
          args.network,
          args.addresses,
          {
            include: args.include,
          }
        );
        break;

      case TOOL_NAMES.GET_TOKEN_INFO:
        result = await toolService.getTokenInfo(args.network, args.address);
        break;

      case TOOL_NAMES.GET_RECENTLY_UPDATED_TOKENS:
        result = await toolService.getRecentlyUpdatedTokens({
          include: args.include,
          network: args.network,
        });
        break;

      case TOOL_NAMES.GET_POOL_OHLCV:
        result = await toolService.getPoolOHLCV(
          args.network,
          args.poolAddress,
          args.timeframe,
          {
            aggregate: args.aggregate,
            before_timestamp: args.before_timestamp,
            limit: args.limit,
            currency: args.currency,
            token: args.token,
            include_empty_intervals: args.include_empty_intervals,
          }
        );
        break;

      case TOOL_NAMES.GET_POOL_TRADES:
        result = await toolService.getPoolTrades(
          args.network,
          args.poolAddress,
          {
            trade_volume_in_usd_greater_than:
              args.trade_volume_in_usd_greater_than,
          }
        );
        break;

      case TOOL_NAMES.GET_GASLESS_PRICE:
        result = await toolService.getGaslessPrice(args);
        break;

      case TOOL_NAMES.GET_GASLESS_QUOTE:
        result = await toolService.getGaslessQuote(args);
        break;

      case TOOL_NAMES.SUBMIT_GASLESS_SWAP:
        result = await toolService.submitGaslessSwap(args);
        break;

      case TOOL_NAMES.GET_GASLESS_STATUS:
        result = await toolService.getGaslessStatus(args);
        break;

      case TOOL_NAMES.GET_GASLESS_CHAINS:
        result = await toolService.getGaslessChains();
        break;

      case TOOL_NAMES.GET_GASLESS_APPROVAL_TOKENS:
        result = await toolService.getGaslessApprovalTokens(args);
        break;

      case TOOL_NAMES.GET_PORTFOLIO_TOKENS:
        result = await toolService.getPortfolioTokens(args);
        break;

      case TOOL_NAMES.GET_PORTFOLIO_BALANCES:
        result = await toolService.getPortfolioBalances(args);
        break;

      case TOOL_NAMES.GET_PORTFOLIO_TRANSACTIONS:
        result = await toolService.getPortfolioTransactions(args);
        break;

      case TOOL_NAMES.CONVERT_WEI_TO_FORMATTED:
        result = await toolService.convertWeiToFormatted(args);
        break;

      case TOOL_NAMES.CONVERT_FORMATTED_TO_WEI:
        result = await toolService.convertFormattedToWei(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Format the result for MCP protocol
    return {
      content: [
        {
          type: "text",
          text:
            typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`Tool execution failed:`, error);
    throw new Error(`Tool execution failed: ${error.message}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("DeFi Trading MCP Server running on stdio");
