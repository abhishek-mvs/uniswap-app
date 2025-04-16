'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXCHANGE_ABI } from '../../Exchange';
import { TOKEN_ABI } from '../../Token';
import { FACTORY_ABI } from '../../Factory';

const LOCAL_EXCHANGE_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c"; // Example local address
const LOCAL_TOKEN_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Example local address

export function LiquidityForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(LOCAL_TOKEN_ADDRESS);
  const [ethAmount, setEthAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

  // Get exchange address from factory
  const exchangeAddress = LOCAL_EXCHANGE_ADDRESS;

  

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('Token balance:', tokenBalance);
  // Get ETH balance
  const { data: ethBalance } = useReadContract({
    address: LOCAL_EXCHANGE_ADDRESS as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'getEthBalance',
    args: [address],
  });
  console.log('ETH balance:', ethBalance);

  const { writeContract } = useWriteContract();
  const { data: tokenAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [address, exchangeAddress],
  });
  console.log('Token allowance:', tokenAllowance);

  const { data: liquidity } = useReadContract({
    address: exchangeAddress as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  console.log('Liquidity:', liquidity);

  const handleApprove = () => {
    if (!tokenAmount || !tokenAddress || !exchangeAddress) return;

    const approveConfig = {
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [exchangeAddress, parseEther(tokenAmount)],
    };

    writeContract(approveConfig);
  };  
  

  // Add liquidity
  const handleAddLiquidity = () => {
    if (!ethAmount || !tokenAmount || !tokenAddress || !exchangeAddress) return;

    const addLiquidityConfig = {
      address: exchangeAddress as `0x${string}`,
      abi: EXCHANGE_ABI,
      functionName: 'addLiquidity',
      args: [parseEther(tokenAmount)],
      value: parseEther(ethAmount),
    };

    writeContract(addLiquidityConfig);
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
        <Label>ETH Amount</Label>
        <Input
          type="number"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>

      <div className="space-y-2">
        <Label>Token Amount</Label>
        <Input
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>

      {tokenBalance !== undefined && (
        <p className="text-sm text-gray-500">
          Token Balance: {formatEther(tokenBalance as bigint)}
        </p>
      )}

      {tokenAllowance !== undefined && (
        <p className="text-sm text-gray-500">
          Token Allowance: {formatEther(tokenAllowance as bigint)}
        </p>
      )}

      {liquidity !== undefined && (
        <p className="text-sm text-gray-500">
          Your Liquidity Position: {formatEther(liquidity as bigint)} LP tokens
        </p>
      )}

      <div className="flex space-x-2">
        <Button
          onClick={handleApprove}
          disabled={!tokenAmount || !tokenAddress || !exchangeAddress}
        >
          Approve Token
        </Button>
        <Button
          onClick={handleAddLiquidity}
          disabled={!ethAmount || !tokenAmount || !tokenAddress || !exchangeAddress}
        >
          Add Liquidity
        </Button>
      </div>
    </div>
  );
} 