# DeFi Trading Agent MCP Server

[![smithery badge](https://smithery.ai/badge/@edkdev/defi-trading-mcp)](https://smithery.ai/server/@edkdev/defi-trading-mcp)

Transform your AI assistant into an autonomous crypto trading agent with real-time market analysis, portfolio management, and seamless trade execution across 17+ blockchains.

## 🤖 Trading Agent Capabilities

### **Autonomous Portfolio Management**

- **Multi-chain Portfolio Analysis**: Track balances, prices, and performance across Ethereum, Base, Polygon, Arbitrum, and 14+ other chains
- **Real-time Portfolio Monitoring**: Get instant updates on your holdings with metadata and price data
- **Transaction History Tracking**: Complete transaction analysis across all supported networks

### **Intelligent Market Analysis**

- **Market Data Intelligence**: Access real-time token prices, trending pools, and DeFi market conditions
- **Liquidity Analysis**: Identify the best trading opportunities across multiple DEXes
- **Token Research**: Get detailed token information, social links, and market metrics

### **Advanced Trade Execution**

- **Smart Price Discovery**: Uses advanced aggregation to find the best prices across all major DEXes
- **Gasless Trading**: Execute trades without holding ETH for gas fees using meta-transactions
- **Multi-chain Swaps**: Trade seamlessly across 17+ supported blockchains
- **Slippage Protection**: Built-in protection against unfavorable price movements

### **Risk Management & Security**

- **Balance Verification**: Automatic balance checks before trade execution
- **Transaction Simulation**: Preview trades before execution
- **Secure Key Management**: Private keys never leave your local environment

## 🎯 Starting Prompt Examples

### **Simple Quote**

```
Get me a quote for 0.1 eth to usdc on Base chain.
```

### **Quote and Swap**

```
Get me a quote for 0.1 eth on ethereum chain and execute the swap.
```

### **Memecoin Opportunity Scanner**

```
"Scan for newly launched memecoins on Base with >$100K liquidity, pick one or two tokens and analyze the best entry opportunities"
```

**Advanced Analysis Process:**

1. **Discovery Phase**: Uses `get_new_pools` to find tokens launched in last 24h
2. **Volume Filtering**: Identifies pools with >$100K liquidity and high trading activity
3. **Technical Analysis**: Pulls OHLCV data to analyze price patterns and momentum
4. **Risk Assessment**: Evaluates liquidity depth, holder concentration, and volatility
5. **Entry Strategy**: Determines optimal entry price, position size, and risk management
6. **Execution**: Places gasless swap with calculated slippage and stop-loss levels

**Example AI Analysis:**

```
"Found 3 promising new tokens:
🚀 $ROCKET (0x123...): 2M volume, bullish OHLCV pattern, 85% liquidity locked
📈 Entry: $0.0001 (current support level)
💰 Size: 2% portfolio allocation
🛡️ Stop: $0.000085 (-15%)
🎯 Target: $0.00015 (+50%)
Executing gasless swap now..."
```

### **Risk Management Agent**

```
"Monitor my portfolio and alert me if any position drops more than 15%"
```

**Agent Actions:**

1. Continuously monitors portfolio values
2. Calculates position changes
3. Provides alerts and recommendations
4. Can execute protective trades

## 🚀 Quick Start

### Installing via Smithery

To install DeFi Trading Agent for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@edkdev/defi-trading-mcp):

```bash
npx -y @smithery/cli install @edkdev/defi-trading-mcp --client claude
```

### **Installation**

```bash
npm install -g defi-trading-mcp
```

### **Create a New Wallet (Recommended)**

```bash
npx defi-trading-mcp --create-wallet
```

This generates a new wallet with private key and address for secure trading.

> 💰 **Need crypto?** See our guide: [How to Load Crypto into Your Wallet](./loadCrypto.md)

## ⚙️ Configuration

### **Required Keys**

- `USER_PRIVATE_KEY`: Your private key (for signing transactions locally, stays local, never transmitted)
- `USER_ADDRESS`: Your Ethereum wallet address
- `COINGECKO_API_KEY`: CoinGecko API key for market data ([How to get your CoinGecko API key](./gecko.md))

### **Optional Configuration**

- `ALCHEMY_API_KEY`: Add an Alchemy API key to use your own RPCs, otherwise public rpcs will be used.

### **🔧 Premium RPC Integration**

Your `ALCHEMY_API_KEY` automatically enables premium RPCs for:

- **15 Major Chains**: Base, Polygon, Arbitrum, Optimism, BSC, Avalanche, Worldchain, Berachain, Blast, Linea, Scroll, Mantle, Ink, MonadTestnet
- **Enhanced Performance**: Lower latency, better uptime
- **Automatic Fallback**: Public RPCs for other chains

### **🔒 Security**

- Private keys remain on your device
- No sensitive data transmitted to external servers
- Secure transaction signing locally

### **MEV Protection**

- **Ethereum transactions** are protected from MEV attacks, sandwich attacks, and front-running
- **Private mempool routing** ensures your trades aren't visible to MEV bots
- **Fair pricing** without manipulation from malicious actors
- **Automatic protection** - no additional configuration required

## 🔧 MCP Client Setup

### **Kiro IDE**

**Step 1: Install the MCP**

```bash
npm install -g defi-trading-mcp
```

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "defi-trading": {
      "command": "npx",
      "args": ["defi-trading-mcp"],
      "env": {
        "USER_PRIVATE_KEY": "your_private_key_here",
        "USER_ADDRESS": "0xYourWalletAddress",
        "COINGECKO_API_KEY": "CG-your_coingecko_api_key",
        "ALCHEMY_API_KEY": "your_alchemy_api_key"
      }
    }
  }
}
```

### **Claude Code**

Add the MCP to Claude Code using the command line:

**Step 1: Install the MCP**

```bash
npm install -g defi-trading-mcp
```

**Step 2: Add to Claude Code - Replace the placeholders with your environment variables**

**For macOS/Linux/WSL:**

```bash
claude mcp add defi-trading \
  -e USER_PRIVATE_KEY=your_private_key_here \
  -e USER_ADDRESS=0xYourWalletAddress \
  -e COINGECKO_API_KEY=CG-your_coingecko_api_key \
  -e ALCHEMY_API_KEY=your_alchemy_api_key \
  -- npx defi-trading-mcp
```

**For Windows (native, not WSL):**

```bash
claude mcp add defi-trading \
  -e USER_PRIVATE_KEY=your_private_key_here \
  -e USER_ADDRESS=0xYourWalletAddress \
  -e COINGECKO_API_KEY=CG-your_coingecko_api_key \
  -e ALCHEMY_API_KEY=your_alchemy_api_key \
  -- cmd /c npx defi-trading-mcp
```

> **Windows Note**: The `cmd /c` wrapper is required on native Windows to prevent "Connection closed" errors when using npx.

**Step 3: Verify the MCP is added**

```bash
claude mcp list
```

**Step 4: Update wallet details (if needed)**
If you need to update your private key or wallet address after initial setup:

```bash
# Remove existing configuration
claude mcp remove defi-trading

# Add back with updated wallet details
claude mcp add defi-trading \
  -e USER_PRIVATE_KEY=your_new_private_key \
  -e USER_ADDRESS=0xYourNewWalletAddress \
  -e COINGECKO_API_KEY=CG-your_coingecko_api_key \
  -e ALCHEMY_API_KEY=your_alchemy_api_key \
  -- npx defi-trading-mcp
```

**Step 5: Start using the trading agent**
Open Claude Code and start trading.
Example Prompt:

```
"Check my portfolio across all chains and find trending memecoins on Base"
```

### **Claude Desktop**

**Step 1: Install the MCP**

```bash
npm install -g defi-trading-mcp
```

Open Claude Desktop.
Click the top left menu with the three dashes.
Click Developer.
Then click Open App Config File.
Your config file will open.
Then add the following.

```json
{
  "mcpServers": {
    "defi-trading": {
      "command": "npx",
      "args": ["defi-trading-mcp"],
      "env": {
        "USER_PRIVATE_KEY": "your_private_key_here",
        "USER_ADDRESS": "0xYourWalletAddress",
        "COINGECKO_API_KEY": "CG-your_coingecko_api_key",
        "ALCHEMY_API_KEY": "your_alchemy_api_key"
      }
    }
  }
}
```

### **Cursor**

**One-Click Install (Recommended)**

Click the button below to automatically install the DeFi Trading MCP in Cursor:

[![Add DeFi Trading MCP to Cursor](https://img.shields.io/badge/Add%20to%20Cursor-Install%20MCP-blue?style=for-the-badge&logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=defi-trading&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJkZWZpLXRyYWRpbmctbWNwIl0sImVudiI6eyJVU0VSX1BSSVZBVEVfS0VZIjoieW91cl9wcml2YXRlX2tleV9oZXJlIiwiVVNFUl9BRERSRVNTIjoiMHhZb3VyV2FsbGV0QWRkcmVzcyIsIkNPSU5HRUNLT19BUElfS0VZIjoiQ0cteW91cl9jb2luZ2Vja29fYXBpX2tleSIsIkFMQ0hFTVlfQVBJX0tFWSI6InlvdXJfYWxjaGVteV9hcGlfa2V5In19)

> **Note**: You'll need to update the environment variables with your actual keys after installation.

**Manual Setup**

**Step 1: Install the MCP**

```bash
npm install -g defi-trading-mcp
```

**Step 2: Add to Cursor Configuration**

1. Open Cursor
2. Go to **Settings** → **Extensions** → **MCP Servers**
3. Add a new server with the following configuration:

```json
{
  "defi-trading": {
    "command": "npx",
    "args": ["defi-trading-mcp"],
    "env": {
      "USER_PRIVATE_KEY": "your_private_key_here",
      "USER_ADDRESS": "0xYourWalletAddress",
      "COINGECKO_API_KEY": "CG-your_coingecko_api_key",
      "ALCHEMY_API_KEY": "your_alchemy_api_key"
    }
  }
}
```

**Step 3: Configure Environment Variables**

Replace the placeholder values with your actual credentials:

- `USER_PRIVATE_KEY`: Your wallet's private key
- `USER_ADDRESS`: Your wallet address  
- `COINGECKO_API_KEY`: Your CoinGecko API key ([Get one here](./gecko.md))
- `ALCHEMY_API_KEY`: Your Alchemy API key (optional)

**Step 4: Start Trading**

Open Cursor and start using the DeFi Trading Agent:

```
"Get me a quote for 0.1 ETH to USDC on Base chain"
```

### Other MCP Clients

For other MCP clients like Github Copilot(mcp.json), Gemini Cli (settings.json), find equivalent file and use the same pattern with environment variables:

```json
{
  "mcpServers": {
    "defi-trading": {
      "command": "npx",
      "args": ["defi-trading-mcp"],
      "env": {
        "USER_PRIVATE_KEY": "your_private_key_here",
        "USER_ADDRESS": "0xYourWalletAddress",
        "COINGECKO_API_KEY": "CG-your_coingecko_api_key",
        "ALCHEMY_API_KEY": "your_alchemy_api_key"
      }
    }
  }
}
```

## 🛠️ Trading Agent Tools

### **Portfolio Management**

- `get_portfolio_tokens` - Multi-chain portfolio analysis with prices and metadata
- `get_portfolio_balances` - Fast balance checking across all chains
- `get_portfolio_transactions` - Complete transaction history analysis

### **Market Intelligence & Analysis**

- `get_trending_pools` - Identify hot trading opportunities with volume metrics
- `get_new_pools` - Discover newly launched tokens and liquidity pools
- `get_pool_ohlcv` - Technical analysis with OHLCV candlestick data
- `get_pool_trades` - Analyze recent trading activity and whale movements
- `get_token_price` - Real-time pricing with 24h change indicators
- `get_token_data` - Deep token research with metadata and social links
- `get_token_info` - Comprehensive token analysis including descriptions
- `search_pools` - Find specific pools by token symbol or contract address

### **Smart Trading**

- `get_swap_price` - Get best prices across all DEXes
- `get_swap_quote` - Get executable quotes with transaction data
- `execute_swap` - Execute trades with optimal routing
- `get_supported_chains` - List all 17+ supported blockchains

### **Gasless Trading**

- `get_gasless_price` - Get prices for gas-free trades
- `get_gasless_quote` - Get gasless swap quotes
- `submit_gasless_swap` - Execute trades without holding ETH
- `get_gasless_status` - Monitor gasless transaction status

### **Utility Tools**

- `convert_wei_to_formatted` - Convert blockchain units to human-readable
- `convert_formatted_to_wei` - Convert amounts to blockchain format

_Plus 25+ additional tools for comprehensive DeFi trading and analysis._

## 🌐 Supported Networks

**17+ Blockchain Networks:**

- **Ethereum** - The original DeFi ecosystem
- **Base** - Coinbase's L2 with low fees
- **Polygon** - Fast and cheap transactions
- **Arbitrum** - Leading Ethereum L2
- **Optimism** - Optimistic rollup scaling
- **BSC** - Binance Smart Chain
- **Avalanche** - Fast. Scalable. Customizable
- **Blast** - Native yield for ETH and stablecoins
- **Linea** - ConsenSys zkEVM
- **Scroll** - zkRollup technology
- **Mantle** - Modular blockchain network
- **Mode** - DeFi-focused L2
- **Worldchain** - World ID integration
- **Unichain** - Uniswap's dedicated chain
- **Berachain** - Proof-of-liquidity consensus
- **Ink** - Kraken's L2 solution
- **MonadTestnet** - Next-gen parallel EVM

_Use `get_supported_chains` for the complete current list._

## 🔐 Security & Trust

### **Local Key Management**

- Private keys never leave your device
- All transaction signing happens locally
- No sensitive data transmitted to servers

## 💡 Agent Use Cases

### **DeFi Portfolio Manager**

```
"Analyze my DeFi portfolio and suggest optimizations"
```

- Tracks performance across all chains
- Identifies underperforming assets
- Suggests rebalancing strategies
- Executes optimization trades

### **Technical Analysis Expert**

```
"Analyze the OHLCV data for trending tokens and identify the best entry points"
```

**Advanced Technical Analysis:**

- **Pattern Recognition**: Identifies bullish/bearish patterns in OHLCV data
- **Support/Resistance**: Calculates key price levels using historical data
- **Volume Analysis**: Analyzes trading volume for momentum confirmation
- **Entry Timing**: Determines optimal entry points based on technical indicators
- **Risk Management**: Sets stop-loss and take-profit levels automatically
- **Position Sizing**: Calculates optimal allocation based on volatility and risk tolerance

**Example Technical Analysis:**

```
"$TOKEN shows strong bullish momentum:
📊 OHLCV Analysis: Higher lows pattern, volume increasing 300%
📈 Support Level: $0.00085 (tested 3x, held strong)
📉 Resistance: $0.0012 (previous high, light volume)
💡 Strategy: Enter at $0.00095, Stop at $0.00082, Target $0.0015
⚖️ Risk/Reward: 1:4 ratio, recommended 1.5% portfolio allocation"
```

### **Arbitrage Hunter**

```
"Look for arbitrage opportunities between chains"
```

- Compares prices across networks
- Identifies profitable spreads
- Calculates gas costs and slippage
- Executes profitable arbitrage

### **Risk Monitor**

```
"Alert me if any of my positions drop more than 10%"
```

- Continuous portfolio monitoring
- Real-time price alerts
- Automatic stop-loss execution
- Risk assessment reports

### **Advanced Market Analysis Agent**

```
"Analyze newly launched memecoins on Base with high volume and determine entry strategy"
```

**Comprehensive Analysis:**

- **Trend Detection**: Identifies trending pools with unusual volume spikes
- **Technical Analysis**: Uses OHLCV data to analyze price patterns and momentum
- **Liquidity Assessment**: Evaluates pool depth and trading sustainability
- **Risk Scoring**: Calculates risk metrics based on volatility and liquidity
- **Entry Optimization**: Determines optimal entry points using technical indicators
- **Position Sizing**: Recommends allocation based on portfolio risk management

**Example Analysis Flow:**

1. **Discovery**: "Find new tokens with >1000% volume increase in last 24h"
2. **Research**: Pulls token metadata, social links, and trading history
3. **Technical Analysis**: Analyzes OHLCV patterns for support/resistance levels
4. **Risk Assessment**: Evaluates liquidity, holder distribution, and volatility
5. **Strategy**: "Enter 2% of portfolio at $0.0001 with stop-loss at $0.00008"
6. **Execution**: Places gasless swap with optimal slippage settings

## 🚀 Why Choose DeFi Trading Agent MCP?

### **For Traders**

- **AI-Powered Analysis**: Advanced market intelligence with OHLCV technical analysis
- **Memecoin Discovery**: Automated scanning for newly launched high-potential tokens
- **Smart Entry Timing**: AI determines optimal entry points using multiple indicators
- **Risk-Managed Trading**: Automated position sizing and stop-loss calculations
- **Multi-chain Efficiency**: Trade across 17+ networks seamlessly
- **Gas Optimization**: Gasless trades save on transaction costs
- **Professional Grade**: Built for high-volume trading

## 💬 Community & Support

### **Join Our Community**

- **[Telegram Group](https://t.me/+fC8GWO3zBe04NTY0)** - Get help, share strategies, and connect with other traders
- **[GitHub Issues](https://github.com/edkdev/defi-trading-mcp/issues)** - Report bugs and request features
- **[GitHub Discussions](https://github.com/edkdev/defi-trading-mcp/discussions)** - General questions and community chat

### **Need Help?**

- 💬 **Quick questions**: Join our Telegram group for real-time support
- 🐛 **Bug reports**: Create an issue on GitHub
- 💡 **Feature requests**: Share your ideas in GitHub Discussions
- 📚 **Documentation**: Check our guides for [CoinGecko API](./gecko.md) and [Loading Crypto](./loadCrypto.md)

---

**Transform your AI into an autonomous crypto trading agent today.**
