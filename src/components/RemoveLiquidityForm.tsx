'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXCHANGE_ABI } from '../../Exchange';
import { FACTORY_ABI } from '../../Factory';

const LOCAL_EXCHANGE_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c"; // Example local address

export function RemoveLiquidityForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(LOCAL_EXCHANGE_ADDRESS);
  const [liquidityAmount, setLiquidityAmount] = useState('');

  // Get exchange address from factory
  const exchangeAddress = LOCAL_EXCHANGE_ADDRESS;
  const { writeContract } = useWriteContract();

  // Get liquidity balance
  const { data: liquidityBalance } = useReadContract({
    address: exchangeAddress as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  console.log('Liquidity balance:', liquidityBalance);
  // Remove liquidity
  const handleRemoveLiquidity = () => {
    if (!liquidityAmount || !tokenAddress || !exchangeAddress) return;

    const removeLiquidityConfig = {
      address: exchangeAddress as `0x${string}`,
      abi: EXCHANGE_ABI,
      functionName: 'removeLiquidity',
      args: [parseEther(liquidityAmount)],
    };

    writeContract(removeLiquidityConfig);
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
        <Label>Liquidity Amount</Label>
        <Input
          type="number"
          value={liquidityAmount}
          onChange={(e) => setLiquidityAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>

      {liquidityBalance !== undefined && (
        <p className="text-sm text-gray-500">
          Liquidity Balance: {formatEther(liquidityBalance as bigint)}
        </p>
      )}

      <Button
        onClick={handleRemoveLiquidity}
        disabled={!liquidityAmount || !tokenAddress || !exchangeAddress}
      >
        Remove Liquidity
      </Button>
    </div>
  );
} 