'use client';

import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletConnectProps {
  onAddressChange: (address: string | null) => void;
}

export default function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      setAddress(address);
      onAddressChange(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed and connected to Sepolia testnet.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!address ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600">Connected Wallet (Sepolia):</p>
          <p className="font-mono text-sm">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
        </div>
      )}
    </div>
  );
} 