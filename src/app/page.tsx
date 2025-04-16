'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiquidityForm } from '@/components/LiquidityForm';
import { SwapForm } from '@/components/SwapForm';
import { RemoveLiquidityForm } from '@/components/RemoveLiquidityForm';
import WalletConnect from '@/components/WalletConnect';

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Uniswap</h1>
          <WalletConnect onAddressChange={setAddress} />
        </div>

        {address ? (
          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove</TabsTrigger>
            </TabsList>
            <TabsContent value="swap">
              <Card className="p-6">
                <SwapForm />
              </Card>
            </TabsContent>
            <TabsContent value="liquidity">
              <Card className="p-6">
                <LiquidityForm />
              </Card>
            </TabsContent>
            <TabsContent value="remove">
              <Card className="p-6">
                <RemoveLiquidityForm />
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">Please connect your wallet to continue</p>
          </div>
        )}
      </div>
    </main>
  );
}
