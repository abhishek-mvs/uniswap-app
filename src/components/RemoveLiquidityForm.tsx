'use client';

import { useState } from 'react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXCHANGE_ABI } from '../../Exchange';
import { FACTORY_ABI } from '../../Factory';

export function RemoveLiquidityForm() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState('');
  const [liquidityAmount, setLiquidityAmount] = useState('');

  // Get exchange address from factory
  const { data: exchangeAddress } = useContractRead({
    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getExchange',
    args: [tokenAddress],
  });

  // Get liquidity balance
  const { data: liquidityBalance } = useContractRead({
    address: exchangeAddress as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!exchangeAddress && !!address,
  });

  // Remove liquidity
  const { write: removeLiquidity } = useContractWrite({
    address: exchangeAddress as `0x${string}`,
    abi: EXCHANGE_ABI,
    functionName: 'removeLiquidity',
    args: [parseEther(liquidityAmount)],
  });

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

      {liquidityBalance && (
        <p className="text-sm text-gray-500">
          Liquidity Balance: {formatEther(liquidityBalance as bigint)}
        </p>
      )}

      <Button
        onClick={() => removeLiquidity()}
        disabled={!liquidityAmount || !tokenAddress || !exchangeAddress}
      >
        Remove Liquidity
      </Button>
    </div>
  );
} 