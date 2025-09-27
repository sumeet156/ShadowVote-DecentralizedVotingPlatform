import * as React from 'react';
import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface ConnectWalletProps {
  onConnect: (address: string, provider: ethers.BrowserProvider) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined') {
      setIsMetaMaskInstalled(!!window.ethereum?.isMetaMask);
    }

    // Add event listener for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log('Wallet disconnected');
          window.location.reload();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when the chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        // Clean up listeners
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask extension.");
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Check if we're on a testnet
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // If not on a test network, request to switch to Sepolia testnet
      if (chainId === 1) {
        try {
          // Try to switch to Sepolia (chainId 11155111)
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xAA36A7' }], // 11155111 in hex
          });
          // Refresh the provider after switching
          setError(null);
          return connectWallet(); // Try connecting again after switching
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xAA36A7',
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://rpc.sepolia.org'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }
                ],
              });
              return connectWallet(); // Try connecting again after adding
            } catch (addError) {
              throw new Error("Failed to add Sepolia testnet to MetaMask");
            }
          }
          throw switchError;
        }
      }
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      onConnect(address, provider);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {isMetaMaskInstalled ? (
        <button 
          onClick={connectWallet}
          disabled={connecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-amber-500 text-sm mb-2">
            MetaMask not detected
          </div>
          <button
            onClick={installMetaMask}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Install MetaMask
          </button>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}