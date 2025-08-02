// src/services/blockchainService.js
import { ethers } from "ethers";

export class BlockchainService {
  constructor(privateKey, alchemyApiKey) {
    this.wallet = null;
    this.providers = {};
    this.alchemyApiKey = alchemyApiKey; // Store the Alchemy API key

    // Initialize wallet if private key is provided
    if (privateKey) {
      this.initializeWallet(privateKey);
    }

    // Initialize providers for supported chains
    this.initializeProviders();
  }

  initializeWallet(privateKey) {
    try {
      this.wallet = new ethers.Wallet(privateKey);
      console.error("Wallet initialized:", this.wallet.address);
    } catch (error) {
      console.error("Failed to initialize wallet:", error.message);
      throw new Error("Invalid private key provided");
    }
  }

  initializeProviders() {
    // Default RPC URLs for all 0x-supported chains (public/free RPCs)
    const defaultRpcUrls = {
      1: "https://rpc.flashbots.net", // Ethereum
      10: "https://mainnet.optimism.io", // Optimism
      56: "https://bsc-dataseed.binance.org", // BSC
      137: "https://polygon.llamarpc.com", // Polygon
      8453: "https://mainnet.base.org", // Base
      42161: "https://arb1.arbitrum.io/rpc", // Arbitrum
      43114: "https://api.avax.network/ext/bc/C/rpc", // Avalanche
      59144: "https://rpc.linea.build", // Linea
      534352: "https://rpc.scroll.io", // Scroll
      5000: "https://rpc.mantle.xyz", // Mantle
      81457: "https://rpc.blast.io", // Blast
      34443: "https://mainnet.mode.network", // Mode
      480: "https://worldchain-mainnet.g.alchemy.com/public", // Worldchain
      10143: "https://testnet1.monad.xyz", // MonadTestnet
      130: "https://rpc.unichain.org", // Unichain
      80094: "https://rpc.berachain.com", // Berachain
      57073: "https://rpc-gel.inkonchain.com", // Ink
    };

    // Alchemy RPC mapping (if ALCHEMY_API_KEY is provided)
    const alchemyChainNames = {
      10: "opt-mainnet", // Optimism
      56: "bnb-mainnet", // BSC
      137: "polygon-mainnet", // Polygon
      8453: "base-mainnet", // Base
      42161: "arb-mainnet", // Arbitrum
      43114: "avax-mainnet", // Avalanche
      480: "worldchain-mainnet", // Worldchain
      81457: "blast-mainnet", // Blast
      59144: "linea-mainnet", // Linea
      534352: "scroll-mainnet", // Scroll
      5000: "mantle-mainnet", // Mantle
      10143: "monad-testnet", // MonadTestnet
      80094: "berachain-mainnet", // Berachain
      57073: "ink-mainnet", // Ink
      // Note: Not all chains are supported by Alchemy
    };

    // Check if Alchemy API key is provided
    const useAlchemy = !!this.alchemyApiKey;

    // Build final RPC URLs
    const rpcUrls = {};
    for (const chainId of Object.keys(defaultRpcUrls)) {
      if (useAlchemy && alchemyChainNames[chainId]) {
        // Use Alchemy RPC if API key is provided and chain is supported
        rpcUrls[
          chainId
        ] = `https://${alchemyChainNames[chainId]}.g.alchemy.com/v2/${this.alchemyApiKey}`;
      } else {
        // Fall back to default public RPC
        rpcUrls[chainId] = defaultRpcUrls[chainId];
      }
    }

    for (const [chainId, rpcUrl] of Object.entries(rpcUrls)) {
      try {
        this.providers[chainId] = new ethers.JsonRpcProvider(rpcUrl);
        const rpcType =
          useAlchemy && alchemyChainNames[chainId] ? "Alchemy" : "default";
        console.error(
          `Chain ${chainId} provider initialized (${rpcType}): ${rpcUrl.substring(
            0,
            50
          )}...`
        );
      } catch (error) {
        console.warn(
          `Failed to initialize provider for chain ${chainId}:`,
          error.message
        );
      }
    }
  }

  getProvider(chainId) {
    const provider = this.providers[chainId.toString()];
    if (!provider) {
      throw new Error(`No provider configured for chain ID ${chainId}`);
    }
    return provider;
  }

  getConnectedWallet(chainId) {
    if (!this.wallet) {
      throw new Error("No private key configured for transaction signing");
    }

    const provider = this.getProvider(chainId);
    return this.wallet.connect(provider);
  }

  async signEIP712Message(domain, types, message) {
    try {
      if (!this.wallet) {
        throw new Error("No private key configured for signing");
      }

      console.log("🔐 Signing EIP-712 message:", {
        domain: domain.name,
        primaryType: Object.keys(types).find((key) => key !== "EIP712Domain"),
        messageKeys: Object.keys(message),
      });

      const signature = await this.wallet.signTypedData(domain, types, message);

      console.log(
        "✅ EIP-712 signature created:",
        signature.substring(0, 20) + "..."
      );

      return signature;
    } catch (error) {
      console.error("Failed to sign EIP-712 message:", error);
      throw new Error(`Failed to sign EIP-712 message: ${error.message}`);
    }
  }

  async signPermit2Message(permit2Data) {
    try {
      if (!permit2Data || !permit2Data.eip712) {
        throw new Error("Invalid permit2 data - missing EIP-712 structure");
      }

      const { domain, types, message } = permit2Data.eip712;
      const signature = await this.signEIP712Message(domain, types, message);

      return {
        signature,
        hash: permit2Data.hash,
        eip712: permit2Data.eip712,
      };
    } catch (error) {
      throw new Error(`Failed to sign Permit2 message: ${error.message}`);
    }
  }

  async signGaslessApproval(approvalData) {
    try {
      if (!approvalData || !approvalData.eip712) {
        throw new Error("Invalid approval data - missing EIP-712 structure");
      }

      const { domain, types, message } = approvalData.eip712;
      const rawSignature = await this.signEIP712Message(domain, types, message);

      return {
        type: approvalData.type,
        eip712: approvalData.eip712,
        signature: rawSignature, // Return raw signature for aggregator to parse
      };
    } catch (error) {
      throw new Error(`Failed to sign gasless approval: ${error.message}`);
    }
  }

  async signGaslessTrade(tradeData) {
    try {
      if (!tradeData || !tradeData.eip712) {
        throw new Error("Invalid trade data - missing EIP-712 structure");
      }

      const { domain, types, message, primaryType } = tradeData.eip712;

      // Use explicit primary type for gasless trades
      const rawSignature = await this.signEIP712MessageWithPrimaryType(
        domain,
        types,
        message,
        primaryType
      );

      return {
        type: tradeData.type,
        eip712: tradeData.eip712,
        signature: rawSignature, // Return raw signature for aggregator to parse
      };
    } catch (error) {
      throw new Error(`Failed to sign gasless trade: ${error.message}`);
    }
  }

  async signEIP712MessageWithPrimaryType(domain, types, message, primaryType) {
    try {
      if (!this.wallet) {
        throw new Error("No private key configured for signing");
      }

      console.log("🔐 Signing EIP-712 message with explicit primary type:", {
        domain: domain.name,
        primaryType: primaryType,
        messageKeys: Object.keys(message),
      });

      // Create a clean types object with only the necessary types for this primary type
      // DO NOT include EIP712Domain - ethers.js handles this automatically
      const cleanTypes = {
        [primaryType]: types[primaryType],
      };

      // Add any referenced types
      const addReferencedTypes = (typeName) => {
        const typeDefinition = types[typeName];
        if (typeDefinition) {
          typeDefinition.forEach((field) => {
            const fieldType = field.type.replace("[]", ""); // Remove array notation
            if (
              types[fieldType] &&
              !cleanTypes[fieldType] &&
              fieldType !== "EIP712Domain"
            ) {
              cleanTypes[fieldType] = types[fieldType];
              addReferencedTypes(fieldType); // Recursively add referenced types
            }
          });
        }
      };

      addReferencedTypes(primaryType);

      console.log(
        "🔧 Using clean types (without EIP712Domain):",
        Object.keys(cleanTypes)
      );

      // Now use the standard signTypedData with clean types
      const signature = await this.wallet.signTypedData(
        domain,
        cleanTypes,
        message
      );

      console.log(
        "✅ EIP-712 signature created:",
        signature.substring(0, 20) + "..."
      );

      return signature;
    } catch (error) {
      console.error("Failed to sign EIP-712 message:", error);
      throw new Error(`Failed to sign EIP-712 message: ${error.message}`);
    }
  }

  async getTransactionCount(chainId, address) {
    try {
      const provider = this.getProvider(chainId);
      const count = await provider.getTransactionCount(address, "pending");
      return Number(count); // Convert BigInt to number
    } catch (error) {
      throw new Error(
        `Failed to get transaction count for chain ${chainId}: ${error.message}`
      );
    }
  }

  async signAndBroadcastTransaction(chainId, quoteData) {
    try {
      if (!this.wallet) {
        throw new Error("No private key configured for transaction signing");
      }

      const connectedWallet = this.getConnectedWallet(chainId);
      const { transaction, permit2 } = quoteData;

      if (!transaction) {
        throw new Error("No transaction data found in quote");
      }

      console.log(`🚀 Processing transaction for chain ${chainId}:`, {
        hasTransaction: !!transaction,
        hasPermit2: !!permit2,
        transactionTo: transaction.to,
        transactionValue: transaction.value || "0",
      });

      // Handle Permit2 signature if present
      let permit2Signature = null;
      if (permit2 && permit2.eip712) {
        console.log("🔐 Processing Permit2 signature...");
        permit2Signature = await this.signPermit2Message(permit2);
        console.error("Permit2 signature ready");
      }

      // Validate Agg quote data
      if (!transaction.gas) {
        throw new Error("No gas estimate found in Agg quote data");
      }
      if (!transaction.gasPrice) {
        throw new Error("No gasPrice found in Agg quote data");
      }

      // Get nonce
      const nonce = await this.getTransactionCount(
        chainId,
        connectedWallet.address
      );

      // Create legacy transaction with exact Agg parameters
      const legacyTxData = {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || "0",
        gasLimit: transaction.gas,
        gasPrice: transaction.gasPrice,
        nonce: nonce,
        type: 0, // Force legacy transaction
      };

      console.log("🚀 Sending LEGACY transaction with exact Agg parameters:", {
        to: legacyTxData.to,
        gasLimit: legacyTxData.gasLimit,
        gasPrice: legacyTxData.gasPrice,
        nonce: legacyTxData.nonce,
        type: "legacy",
      });

      // Sign and send transaction
      console.error("🚀 Broadcasting transaction to network...");
      const signedTx = await connectedWallet.sendTransaction(legacyTxData);
      console.error(`Transaction broadcasted: ${signedTx.hash}`);

      // Return only relevant fields for legacy transactions
      return {
        hash: signedTx.hash,
        from: signedTx.from,
        to: signedTx.to,
        value: signedTx.value?.toString(),
        gasLimit: signedTx.gasLimit?.toString(),
        gasPrice: signedTx.gasPrice?.toString(),
        nonce: signedTx.nonce?.toString(),
        chainId: signedTx.chainId?.toString(),
        type: signedTx.type?.toString(),
        permit2Signed: !!permit2Signature,
        permit2Hash: permit2Signature?.hash,
      };
    } catch (error) {
      console.error("Transaction signing/broadcasting failed:", error);
      throw new Error(
        `Failed to sign and broadcast transaction: ${error.message}`
      );
    }
  }

  async waitForTransaction(
    chainId,
    txHash,
    confirmations = 1,
    timeout = 300000
  ) {
    try {
      const provider = this.getProvider(chainId);

      console.log(
        `⏳ Waiting for transaction ${txHash} with ${confirmations} confirmations...`
      );

      const receipt = await provider.waitForTransaction(
        txHash,
        confirmations,
        timeout
      );

      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber?.toString(),
        blockHash: receipt.blockHash,
        transactionIndex: receipt.transactionIndex?.toString(),
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed?.toString(),
        cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        status: receipt.status,
        logs: receipt.logs?.map((log) => ({
          ...log,
          blockNumber: log.blockNumber?.toString(),
          transactionIndex: log.transactionIndex?.toString(),
          logIndex: log.logIndex?.toString(),
        })),
        confirmations: (await receipt.confirmations())?.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to wait for transaction: ${error.message}`);
    }
  }

  async getTransactionStatus(chainId, txHash) {
    try {
      const provider = this.getProvider(chainId);

      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return { status: "not_found" };
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          status: "pending",
          transaction: {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value?.toString(),
            gasLimit: tx.gasLimit?.toString(),
            gasPrice: tx.gasPrice?.toString(),
            nonce: tx.nonce?.toString(),
          },
        };
      }

      return {
        status: receipt.status === 1 ? "success" : "failed",
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value?.toString(),
          gasLimit: tx.gasLimit?.toString(),
          gasPrice: tx.gasPrice?.toString(),
          nonce: tx.nonce?.toString(),
        },
        receipt: {
          blockNumber: receipt.blockNumber?.toString(),
          blockHash: receipt.blockHash,
          gasUsed: receipt.gasUsed?.toString(),
          effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
          status: receipt.status,
          confirmations: (await receipt.confirmations())?.toString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  getSupportedChains() {
    return Object.keys(this.providers).map((chainId) => parseInt(chainId));
  }

  isChainSupported(chainId) {
    return this.getSupportedChains().includes(parseInt(chainId));
  }

  getWalletAddress() {
    return this.wallet ? this.wallet.address : null;
  }
}
