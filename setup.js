#!/usr/bin/env node

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 DeFi Trading MCP Server Setup\n");

// Check if running in development mode
const isDev = process.argv.includes("--dev");

if (isDev) {
  console.log("📝 Setting up for local development...\n");

  // Copy .env.example to .env if it doesn't exist
  const envExamplePath = path.join(__dirname, ".env.example");
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env file from .env.example");
    console.log(
      "📝 Please edit .env file with your actual API keys and private key\n"
    );
  } else if (fs.existsSync(envPath)) {
    console.log("✅ .env file already exists\n");
  }
} else {
  console.log("📋 MCP Client Configuration Examples:\n");

  console.log("🔧 For Kiro IDE (~/.kiro/settings/mcp.json):");
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          "defi-trading-mcp": {
            command: "npx",
            args: ["defi-trading-mcp"],
            env: {
              USER_PRIVATE_KEY: "your_private_key_here",
              USER_ADDRESS: "0xYourWalletAddress",
              COINGECKO_API_KEY: "CG-your_coingecko_api_key",
              ALCHEMY_API_KEY: "your_alchemy_api_key",
            },
          },
        },
      },
      null,
      2
    )
  );

  console.log("\n🔧 For Claude Desktop (claude_desktop_config.json):");
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          "defi-trading-mcp": {
            command: "npx",
            args: ["defi-trading-mcp"],
            env: {
              USER_PRIVATE_KEY: "your_private_key_here",
              USER_ADDRESS: "0xYourWalletAddress",
              COINGECKO_API_KEY: "CG-your_coingecko_api_key",
              ALCHEMY_API_KEY: "your_alchemy_api_key"
            },
          },
        },
      },
      null,
      2
    )
  );

  console.log("\n📋 Required Environment Variables:");
  console.log("• USER_PRIVATE_KEY: Your Ethereum private key");
  console.log("• USER_ADDRESS: Your Ethereum wallet address");
  console.log("• COINGECKO_API_KEY: Your CoinGecko API key");
  console.log("• ALCHEMY_API_KEY: Your Alchemy API key");


  console.log("\n🔐 Security Note:");
  console.log(
    "Your private key is only used locally for transaction signing and never sent to external servers."
  );
}

console.log("\n📚 For more information, see the README.md file.");
console.log(
  "🎯 Available tools: gasless swaps, portfolio tracking, DeFi data, and more!"
);
