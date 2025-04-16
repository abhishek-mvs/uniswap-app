'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXCHANGE_ABI } from '../../Exchange';
import { TOKEN_ABI } from '../../Token';
import { FACTORY_ABI } from '../../Factory';

// Local deployment addresses - update these with your deployed contract addresses
const LOCAL_EXCHANGE_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c"; // Example local address
const LOCAL_TOKEN_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Example local address

export function SwapForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(LOCAL_TOKEN_ADDRESS);
  const [outputAmount, setOutputAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [isFromToken, setIsFromToken] = useState(true);
  
  useEffect(() => {
    handleGetOutputAmount();
  }, [amount, tokenAddress]);

  // Get user's token balance
  const { data: tokenOwner } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('User token balance:', tokenOwner);

  // Get ETH reserves in the exchange
  const { data: ethBalance } = useBalance({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
  });
  console.log('Exchange ETH reserves:', ethBalance);

  // Get token reserves in the exchange
  const { data: tokenAllowance } = useReadContract({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'getReserve',
  });
  console.log('Exchange token reserves:', tokenAllowance);

  // Calculate exchange rate if both reserves are available
  const exchangeRate = ethBalance && tokenAllowance ? 
    Number(formatEther(ethBalance.value)) / Number(formatEther(tokenAllowance as bigint)) : 
    null;
  
  const { writeContract } = useWriteContract();

  const handleSwap = () => {
    if (!amount || !tokenAddress) return;

    const swapConfig = {
      address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
      abi: EXCHANGE_ABI,
      functionName: isFromToken ? 'tokenToEthSwap' : 'ethToTokenSwap',
      args: [parseEther(amount)],
      value: isFromToken ? undefined : parseEther(amount),
    };

    writeContract(swapConfig);
  };

  const handleGetOutputAmount = () => {
    if (!amount || !tokenAddress) return;

    const { data: outputAmount } = useReadContract({
      address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
      abi: EXCHANGE_ABI,
      functionName: isFromToken ? 'getEthAmount' : 'getTokenAmount',
      args: [parseEther(amount)],
    });

    console.log('Output amount:', outputAmount);
    
  };
  
  
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Token Address</Label>
        <Input
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={isFromToken ? 'default' : 'outline'}
          onClick={() => setIsFromToken(true)}
        >
          Token to ETH
        </Button>
        <Button
          variant={!isFromToken ? 'default' : 'outline'}
          onClick={() => setIsFromToken(false)}
        >
          ETH to Token
        </Button>
      </div>

      {tokenOwner !== undefined && (
        <p className="text-sm text-gray-500">
          Token Balance: {formatEther(tokenOwner as bigint)}
        </p>
      )}
      {ethBalance !== undefined && tokenAllowance !== undefined && (
        <>
          <p className="text-sm text-gray-500">
            Exchange ETH Reserve: {formatEther(ethBalance.value)}
          </p>
          <p className="text-sm text-gray-500">
            Exchange Token Reserve: {formatEther(tokenAllowance as bigint)}
          </p>
          {exchangeRate && (
            <p className="text-sm text-gray-500">
              Exchange Rate: 1 Token = {exchangeRate.toFixed(6)} ETH
            </p>
          )}
        </>
      )}

      <Button
        onClick={handleSwap}
        disabled={!amount || !tokenAddress}
      >
        Swap
      </Button>
    </div>
  );
} 