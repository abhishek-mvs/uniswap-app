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
const LOCAL_EXCHANGE_ADDRESS = process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS;
const LOCAL_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

export function SwapForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(LOCAL_TOKEN_ADDRESS);
  const [amount, setAmount] = useState('');
  const [isFromToken, setIsFromToken] = useState(true);
  const [minExpectedAmount, setMinExpectedAmount] = useState(BigInt(0));
  
  // Get output amount based on input
  const { data: expectedAmount } = useReadContract({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: isFromToken ? 'getEthAmount' : 'getTokenAmount',
    args: [parseEther(amount)],
    query: {
      enabled: Number(amount) > 0
    }
  });

  useEffect(() => {
    if (expectedAmount) {
     handleGetOutputAmount();
    }
  }, [expectedAmount, amount, isFromToken]);

  // Get user's token balance
  const { data: tokenOwner } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('User token balance:', tokenOwner);
  
  const { data: userEthBalance } = useBalance({
    address: address as `0x${string}`,
  });
  console.log('User ETH balance:', userEthBalance);
  // Get ETH reserves in the exchange
  const { data: ethBalance } = useBalance({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
  });
  console.log('Exchange ETH reserves:', ethBalance);

  const { data: tokenReserve } = useReadContract({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'getReserve',
  });
  console.log('Token reserves:', tokenReserve);
  // Get token reserves in the exchange
  const { data: tokenAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [address, LOCAL_EXCHANGE_ADDRESS],
  });
  console.log('Token allowance:', tokenAllowance);

  // Calculate exchange rate if both reserves are available
  const exchangeRate = ethBalance && tokenAllowance ? 
    Number(formatEther(ethBalance.value)) / Number(formatEther(tokenAllowance as bigint)) : 
    null;
  
  const { writeContract } = useWriteContract();

  const handleApprove = () => {
    if (!amount || !tokenAddress || !LOCAL_EXCHANGE_ADDRESS) return;

    const approveConfig = {
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [LOCAL_EXCHANGE_ADDRESS, parseEther(amount)],
    };

    writeContract(approveConfig);
  };  

  const handleSwap = async () => {
    if (!minExpectedAmount || !tokenAddress || !amount) return;

    // For token to ETH swap, check and handle approval first
    if (isFromToken) {
      console.log('Token to ETH swap');
      const parsedAmount = parseEther(amount);
      if (!tokenAllowance || (tokenAllowance as bigint) < parsedAmount) {
        handleApprove();
        return;
      }
    }

    let swapConfig;
    if (isFromToken) {
      swapConfig = {
        address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
        abi: EXCHANGE_ABI,
        functionName: 'tokenToEthSwap',
        args: [parseEther(amount), minExpectedAmount],
      };
    }
    else {
      swapConfig = {
        address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
        abi: EXCHANGE_ABI,
        functionName: 'ethToTokenSwap',
        args: [minExpectedAmount],
        value: parseEther(amount),
      };
    }
    console.log('Swap config:', swapConfig);
    writeContract(swapConfig);
  };

  const handleGetOutputAmount = () => {
    if (!expectedAmount || !tokenAddress) return;
    const minOutput = ((expectedAmount as bigint) * BigInt(99)) / BigInt(100);
    setMinExpectedAmount(minOutput);
    console.log('Output amount:', expectedAmount);
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

      {amount && minExpectedAmount !== BigInt(0) && (
        <div className="p-3 bg-gray-100 rounded-md">
          <p className="text-sm font-medium">
            You will receive approximately: {formatEther(minExpectedAmount as bigint)} {isFromToken ? 'Sepolia' : 'Tokens'}
          </p>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <h3 className="font-medium text-gray-900">Your Balances</h3>
        {userEthBalance && (
          <p className="text-sm text-gray-700">
            Sepolia Balance: {formatEther(userEthBalance.value)} Sepolia
          </p>
        )}
        {tokenOwner !== undefined && (
          <p className="text-sm text-gray-700">
            Token Balance: {formatEther(tokenOwner as bigint)} Tokens
          </p>
        )}
        
        <h3 className="font-medium text-gray-900 pt-2">Token Allowance</h3>
        {tokenAllowance !== undefined && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Current Allowance: {formatEther(tokenAllowance as bigint)} Tokens
            </p>
            <Button
              onClick={handleApprove}
              variant="outline"
              className="w-full"
            >
              Approve Tokens for Trading
            </Button>
          </div>
        )}
        
        <h3 className="font-medium text-gray-900 pt-2">Price</h3>
        {ethBalance !== undefined && tokenReserve !== undefined && (
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              1 Token = {(Number(formatEther(ethBalance.value)) / Number(formatEther(tokenReserve as bigint))).toFixed(6)} Sepolia
            </p>
            <p className="text-sm text-gray-700">
              1 Sepolia = {(Number(formatEther(tokenReserve as bigint)) / Number(formatEther(ethBalance.value))).toFixed(6)} Tokens
            </p>
          </div>
        )}
        
        <h3 className="font-medium text-gray-900 pt-2">Liquidity Pool</h3>
        {ethBalance !== undefined && (
          <p className="text-sm text-gray-700">
            Sepolia Reserve: {formatEther(ethBalance.value)} Sepolia
          </p>
        )}
        {tokenReserve !== undefined && (
          <p className="text-sm text-gray-700">
            Token Reserve: {formatEther(tokenReserve as bigint)} Tokens
          </p>
        )}
        
        {exchangeRate && (
          <div className="pt-2">
            <h3 className="font-medium text-gray-900">Exchange Rate</h3>
            <p className="text-sm text-gray-700">
              1 Token = {exchangeRate.toFixed(6)} Sepolia
            </p>
            <p className="text-sm text-gray-700">
              1 Sepolia = {(1 / exchangeRate).toFixed(6)} Tokens
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={handleSwap}
        disabled={!amount || !tokenAddress}
      >
        Swap
      </Button>
    </div>
  );
} 