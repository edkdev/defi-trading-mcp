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
    // Default RPC URLs for all supported chains (public/free RPCs)
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

      const { domain, types, message, primaryType } = permit2Data.eip712;

     
      const cleanTypes = { ...types };
      delete cleanTypes.EIP712Domain;

      console.log(
        "🔐 Signing Permit2 with cleaned types:",
        Object.keys(cleanTypes)
      );

      const signature = await this.wallet.signTypedData(
        domain,
        cleanTypes,
        message
      );

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
      const { transaction, permit2, sellToken, sellAmount } = quoteData;

      if (!transaction) {
        throw new Error("No transaction data found in quote");
      }

      console.log(`🚀 Processing transaction for chain ${chainId}:`, {
        hasTransaction: !!transaction,
        hasPermit2: !!permit2,
        transactionTo: transaction.to,
        transactionValue: transaction.value || "0",
      });

      // Step 1: Handle token allowance for Permit2 (if needed)
      const PERMIT2_CONTRACT = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
      let allowanceResult = null;

      if (permit2 && sellToken && sellAmount) {
        console.log("🔍 Checking token allowance for Permit2...");
        try {
          allowanceResult = await this.ensureTokenAllowance(
            chainId,
            sellToken,
            PERMIT2_CONTRACT,
            sellAmount
          );

          if (allowanceResult.approved) {
            console.log("✅ Token allowance set for Permit2 contract");
          } else {
            console.log("✅ Sufficient token allowance already exists");
          }
        } catch (error) {
          console.warn(
            "⚠️ Token allowance check failed, proceeding anyway:",
            error.message
          );
          // Continue with swap execution even if allowance check fails
          // The transaction will fail if allowance is actually insufficient
        }
      }

      // Step 2: Prepare transaction data - start with original data
      let transactionData = transaction.data;

      // Step 3: Handle Permit2 signature if present
      let permit2Signature = null;
      if (permit2 && permit2.eip712) {
        console.log("🔐 Processing Permit2 signature...");
        permit2Signature = await this.signPermit2Message(permit2);
        console.log("✅ Permit2 signature created");

       
        const signature = permit2Signature.signature;

        // Ensure signature has 0x prefix and is properly formatted
        const cleanSignature = signature.startsWith("0x") ? signature : "0x" + signature;

        // Validate signature format (should be 65 bytes = 130 hex chars + 0x prefix = 132 total)
        if (cleanSignature.length !== 132) {
          throw new Error(`Invalid signature length: expected 132 chars (65 bytes), got ${cleanSignature.length}`);
        }

        // Calculate signature size in bytes (following viem's size() function logic)
        const signatureBytes = ethers.getBytes(cleanSignature);
        const signatureSize = signatureBytes.length; // Should be 65 bytes

        // Create signature length as 32-byte unsigned big-endian integer (following viem's numberToHex)
        const signatureLengthInHex = ethers.zeroPadValue(
          ethers.toBeHex(signatureSize),
          32
        );

        // Append signature length and signature data to transaction data (following viem's concat)
        transactionData = ethers.concat([
          transaction.data,
          signatureLengthInHex,
          cleanSignature,
        ]);

        console.log("🔧 Permit2 signature embedded in transaction data:", {
          originalDataLength: transaction.data.length,
          signatureSize: signatureSize,
          newDataLength: ethers.hexlify(transactionData).length,
          signatureLengthHex: ethers.hexlify(signatureLengthInHex).substring(0, 20) + "...",
          signaturePreview: cleanSignature.substring(0, 20) + "...",
        });
      }

      // Step 4: Validate quote data
      if (!transaction.gas) {
        throw new Error("No gas estimate found in quote data");
      }
      if (!transaction.gasPrice) {
        throw new Error("No gasPrice found in quote data");
      }

      // Step 5: Get nonce
      const nonce = await this.getTransactionCount(
        chainId,
        connectedWallet.address
      );

      // Step 6: Create legacy transaction with embedded Permit2 signature
      const legacyTxData = {
        to: transaction.to,
        data: transactionData, // Use modified data with embedded signature
        value: transaction.value || "0",
        gasLimit: transaction.gas,
        gasPrice: transaction.gasPrice,
        nonce: nonce,
        type: 0, // Force legacy transaction
      };

      console.log("🚀 Sending transaction with Permit2 signature embedded:", {
        to: legacyTxData.to,
        gasLimit: legacyTxData.gasLimit,
        gasPrice: legacyTxData.gasPrice,
        nonce: legacyTxData.nonce,
        type: "legacy",
        hasPermit2Embedded: !!permit2Signature,
        dataLength: transactionData.length,
        allowanceHandled: !!allowanceResult,
      });

      // Step 7: Sign and send transaction
      console.log("🚀 Broadcasting transaction to network...");
      const signedTx = await connectedWallet.sendTransaction(legacyTxData);
      console.log(`✅ Transaction broadcasted: ${signedTx.hash}`);

      // Return transaction details
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
        permit2Embedded: !!permit2Signature,
        allowanceResult: allowanceResult,
        steps: [
          "1. ✅ Token allowance checked/set for Permit2",
          "2. ✅ Permit2 EIP-712 message signed",
          "3. ✅ Signature embedded in transaction data",
          "4. ✅ Transaction broadcasted to network",
        ],
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

  async checkTokenAllowance(
    chainId,
    tokenAddress,
    ownerAddress,
    spenderAddress
  ) {
    try {
      const provider = this.getProvider(chainId);

      // ERC20 allowance function ABI
      const erc20Abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        provider
      );
      const allowance = await tokenContract.allowance(
        ownerAddress,
        spenderAddress
      );

      return allowance.toString();
    } catch (error) {
      throw new Error(`Failed to check token allowance: ${error.message}`);
    }
  }

  async approveToken(chainId, tokenAddress, spenderAddress, amount) {
    try {
      if (!this.wallet) {
        throw new Error("No private key configured for token approval");
      }

      const connectedWallet = this.getConnectedWallet(chainId);

      // ERC20 approve function ABI
      const erc20Abi = [
        "function approve(address spender, uint256 amount) returns (bool)",
      ];

      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        connectedWallet
      );

      console.log(
        `🔐 Approving ${amount} tokens for spender ${spenderAddress}...`
      );

      // Send approval transaction
      const tx = await tokenContract.approve(spenderAddress, amount);

      console.log(`✅ Approval transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log(`✅ Approval confirmed in block ${receipt.blockNumber}`);

      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber?.toString(),
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status,
      };
    } catch (error) {
      throw new Error(`Failed to approve token: ${error.message}`);
    }
  }

  async ensureTokenAllowance(
    chainId,
    tokenAddress,
    spenderAddress,
    requiredAmount
  ) {
    try {
      const ownerAddress = this.getWalletAddress();
      if (!ownerAddress) {
        throw new Error("No wallet address available");
      }

      console.log(`🔍 Checking token allowance for ${tokenAddress}...`);

      // Check current allowance
      const currentAllowance = await this.checkTokenAllowance(
        chainId,
        tokenAddress,
        ownerAddress,
        spenderAddress
      );

      const currentAllowanceBN = ethers.getBigInt(currentAllowance);
      const requiredAmountBN = ethers.getBigInt(requiredAmount);

      console.log(`Current allowance: ${currentAllowance}`);
      console.log(`Required amount: ${requiredAmount}`);

      if (currentAllowanceBN >= requiredAmountBN) {
        console.log("✅ Sufficient allowance already exists");
        return {
          approved: false,
          reason: "sufficient_allowance",
          currentAllowance: currentAllowance,
          requiredAmount: requiredAmount,
        };
      }

      console.log("⚠️ Insufficient allowance, approving maximum amount...");

      // Approve maximum amount (2^256 - 1) for convenience
      const maxAmount = ethers.MaxUint256;
      const approvalResult = await this.approveToken(
        chainId,
        tokenAddress,
        spenderAddress,
        maxAmount
      );

      return {
        approved: true,
        reason: "insufficient_allowance",
        approvalTransaction: approvalResult,
        approvedAmount: maxAmount.toString(),
        previousAllowance: currentAllowance,
      };
    } catch (error) {
      throw new Error(`Failed to ensure token allowance: ${error.message}`);
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
