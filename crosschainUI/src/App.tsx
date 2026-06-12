import { useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { Wallet, Activity, ChevronRight, RefreshCw, LogOut } from 'lucide-react';
import { NETWORKS, POOLS, LOCAL_STAKING_ABI, STAKING_ADAPTER_ABI, NATIVE_STAKING_ABI, ERC20_ABI } from './config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Stake {
  pool: typeof POOLS[0];
  amount: string;
  reward: string;
  startTime: number;
}

function App() {
  const [, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [userStakes, setUserStakes] = useState<Stake[]>([]);
  const [fetchingStakes, setFetchingStakes] = useState<boolean>(false);

  // Modal State
  const [selectedPool, setSelectedPool] = useState<any | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<'native' | 'usdc'>('native');
  
  // Withdraw Modal State
  const [withdrawStake, setWithdrawStake] = useState<Stake | null>(null);
  const [targetNetworkId, setTargetNetworkId] = useState<number>(7001); // default ZETA

  const currentNetwork = chainId ? NETWORKS[chainId as keyof typeof NETWORKS] : null;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _address = await _signer.getAddress();
        const _network = await _provider.getNetwork();
        
        setProvider(_provider);
        setSigner(_signer);
        setAddress(_address);
        setChainId(Number(_network.chainId));
        fetchStakes(_address);
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(targetChainId) }],
      });
    } catch (error: any) {
      console.error(error);
      alert("Failed to switch network or network not added to MetaMask.");
    }
  };

  const fetchStakes = async (userAddress: string) => {
    if (!userAddress) return;
    setFetchingStakes(true);
    
    const providers = {
      11155111: new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia"),
      97: new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545"),
      7001: new ethers.JsonRpcProvider("https://zetachain-athens-evm.blockpi.network/v1/rpc/public")
    };
    
    const stakesList: Stake[] = [];
    
    for (const pool of POOLS) {
      try {
        const provider = providers[pool.chainId as keyof typeof providers];
        const network = NETWORKS[pool.chainId as keyof typeof NETWORKS];
        const contractAbi = network.isZetaNative ? NATIVE_STAKING_ABI : LOCAL_STAKING_ABI;
        const contract = new ethers.Contract(network.stakingAddress, contractAbi, provider);
        
        const stakeInfo = await contract.stakes(userAddress, pool.poolId);
        if (stakeInfo.amount > 0n) {
          const reward = network.isZetaNative 
            ? await contract.getPendingReward(pool.poolId, userAddress)
            : await contract.getPendingReward(userAddress, pool.poolId);
          stakesList.push({
             pool,
             amount: ethers.formatEther(stakeInfo.amount),
             reward: ethers.formatEther(reward),
             startTime: Number(stakeInfo.stakeTime || stakeInfo.startTime)
          });
        }
      } catch (e) {
        console.error("Error fetching stake for pool", pool, e);
      }
    }
    
    setUserStakes(stakesList);
    setFetchingStakes(false);
  };

  const handleStake = async () => {
    if (!signer || !currentNetwork || !selectedPool || !amount) return;
    setLoading(true);
    
    try {
      const parsedAmount = ethers.parseEther(amount);
      const isNativeAsset = selectedAsset === 'native';
      const tokenAddress = isNativeAsset ? ethers.ZeroAddress : currentNetwork.usdcAddress;
      
      const isLocal = currentNetwork.id === selectedPool.chainId;
      const isZetaHub = currentNetwork.isZetaNative;
      
      const stakingContractAddr = currentNetwork.stakingAddress;

      if (!isNativeAsset) {
        const usdcContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const allowance = await usdcContract.allowance(address, stakingContractAddr);
        if (allowance < parsedAmount) {
          const txApprove = await usdcContract.approve(stakingContractAddr, parsedAmount);
          await txApprove.wait();
        }
      }

      if (isZetaHub) {
        const stakingContract = new ethers.Contract(stakingContractAddr, NATIVE_STAKING_ABI, signer);
        const value = isNativeAsset ? parsedAmount : 0n;
        const tx = await stakingContract.stake(selectedPool.poolId, parsedAmount, { value });
        await tx.wait();
      } else {
        const value = isNativeAsset ? parsedAmount : 0n;
        
        if (isLocal) {
          const stakingContract = new ethers.Contract(stakingContractAddr, LOCAL_STAKING_ABI, signer);
          const tx = await stakingContract.stakeLocal(selectedPool.poolId, parsedAmount, { value });
          await tx.wait();
        } else {
          const adapterContract = new ethers.Contract(currentNetwork.adapterAddress, STAKING_ADAPTER_ABI, signer);
          const tx = await adapterContract.stakeCrossChain(selectedPool.poolId, selectedPool.chainId, selectedPool.poolId, parsedAmount, { value });
          await tx.wait();
        }
      }

      alert("Staking Successful!");
      setSelectedPool(null);
      setAmount('');
      fetchStakes(address);
    } catch (error: any) {
      console.error("Staking failed:", error);
      alert("Staking failed: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!signer || !currentNetwork || !withdrawStake) return;
    setLoading(true);
    
    try {
      const isLocal = currentNetwork.id === targetNetworkId;
      const stakingContractAddr = NETWORKS[withdrawStake.pool.chainId as keyof typeof NETWORKS].stakingAddress;
      const targetNetworkInfo = NETWORKS[targetNetworkId as keyof typeof NETWORKS];
      
      // We must be connected to the pool's network to withdraw!
      if (currentNetwork.id !== withdrawStake.pool.chainId) {
         throw new Error("You must be connected to the network where your stake is held.");
      }

      if (withdrawStake.pool.chainId === 7001) {
        // ZetaChain Native Staking
        const stakingContract = new ethers.Contract(stakingContractAddr, NATIVE_STAKING_ABI, signer);
        if (isLocal) {
          const tx = await stakingContract.withdraw(withdrawStake.pool.poolId);
          await tx.wait();
        } else {
          const zrc20 = targetNetworkInfo.zrc20;
          const tx = await stakingContract.withdrawToTargetChain(withdrawStake.pool.poolId, targetNetworkId, zrc20);
          await tx.wait();
        }
      } else {
        // Edge Chain Staking (Sepolia / BSC)
        const amount = ethers.parseEther(withdrawStake.amount);
        if (isLocal) {
          const stakingContract = new ethers.Contract(stakingContractAddr, LOCAL_STAKING_ABI, signer);
          const tx = await stakingContract.withdrawLocal(withdrawStake.pool.poolId, amount);
          await tx.wait();
        } else {
          const adapterContract = new ethers.Contract(NETWORKS[withdrawStake.pool.chainId as keyof typeof NETWORKS].adapterAddress, STAKING_ADAPTER_ABI, signer);
          const tx = await adapterContract.withdrawCrossChain(withdrawStake.pool.poolId, targetNetworkId, withdrawStake.pool.poolId, amount);
          await tx.wait();
        }
      }

      alert("Withdrawal Successful! It may take a few minutes for cross-chain routing.");
      setWithdrawStake(null);
      fetchStakes(address);
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  const renderPoolsByChain = (cId: number) => {
    const pools = POOLS.filter(p => p.chainId === cId);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {pools.map((pool, idx) => (
          <div 
            key={idx} 
            className="panel-glass rounded-xl p-5 border border-[rgba(255,255,255,0.05)] cursor-pointer hover:border-action-blue transition-colors"
            onClick={() => setSelectedPool(pool)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">{pool.tokenName} Pool</h3>
              <div className="flex gap-2">
                <span className="text-purple-400 font-mono font-medium bg-[rgba(168,85,247,0.1)] px-2 py-1 rounded-md text-xs">
                  Lock: {pool.lockPeriod}
                </span>
                <span className="text-action-blue font-mono font-bold bg-[rgba(0,102,204,0.1)] px-3 py-1 rounded-full text-sm">
                  {pool.apy} APY
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-mono break-all">{pool.tokenAddress === ethers.ZeroAddress ? "Native Asset" : pool.tokenAddress}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-action-blue selection:text-white">
      {/* Global Navigation */}
      <nav className="sticky top-0 z-50 nav-blur border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-action-blue to-blue-400 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">OmniStake</span>
          </div>
          <div className="flex items-center gap-4">
            {address ? (
              <div className="flex items-center gap-3 bg-[#1c1c1e] px-4 py-2 rounded-full border border-[rgba(255,255,255,0.05)]">
                <div className={`w-2 h-2 rounded-full ${currentNetwork ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm font-medium text-gray-200">
                  {currentNetwork ? currentNetwork.name : 'Unsupported Network'}
                </span>
                <div className="w-px h-4 bg-gray-700 mx-1"></div>
                <span className="text-sm font-mono text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-action-blue hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] hover:shadow-[0_0_25px_rgba(0,102,204,0.5)] flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {address && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-action-blue to-purple-400 bg-clip-text text-transparent">
                My Staked Assets
              </h1>
              <button 
                onClick={() => fetchStakes(address)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${fetchingStakes ? 'animate-spin text-action-blue' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>

            {fetchingStakes && userStakes.length === 0 ? (
              <div className="p-8 text-center border border-[rgba(255,255,255,0.05)] rounded-2xl bg-bg-dark panel-glass">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-action-blue border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400">Scanning networks for your staked assets...</p>
              </div>
            ) : userStakes.length === 0 ? (
              <div className="p-8 text-center border border-[rgba(255,255,255,0.05)] rounded-2xl bg-bg-dark panel-glass">
                <p className="text-gray-400">You do not have any active stakes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userStakes.map((stake, idx) => (
                  <div key={idx} className="panel-glass rounded-xl p-5 border border-[rgba(255,255,255,0.05)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                      {NETWORKS[stake.pool.chainId as keyof typeof NETWORKS]?.name}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-1">Staked Amount</p>
                      <h4 className="text-2xl font-bold text-white font-mono">{Number(stake.amount).toFixed(4)}</h4>
                    </div>
                    <div className="mt-4 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Accrued Reward</p>
                        <p className="text-lg text-action-blue font-mono font-medium">+{Number(stake.reward).toFixed(6)}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setTargetNetworkId(stake.pool.chainId); // default to same chain
                          setWithdrawStake(stake);
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Withdraw
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">
            Available Pools
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-8">
            Stake directly from your connected network into any remote pool using native omnichain routing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span> Sepolia Pools
          </h2>
          {renderPoolsByChain(11155111)}

          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2 mt-12">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span> BSC Testnet Pools
          </h2>
          {renderPoolsByChain(97)}

          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2 mt-12">
            <span className="w-3 h-3 rounded-full bg-green-500"></span> ZetaChain Pools
          </h2>
          {renderPoolsByChain(7001)}
        </div>
      </main>

      {/* Stake Modal */}
      {selectedPool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-dark border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedPool(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-semibold mb-2">Stake to {selectedPool.tokenName} Pool</h2>
            <p className="text-sm text-gray-400 mb-6">Target Network: {NETWORKS[selectedPool.chainId as keyof typeof NETWORKS]?.name}</p>

            {!currentNetwork ? (
              <div className="text-center py-6">
                <p className="text-yellow-400 mb-4">Please connect your wallet to a supported network first.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => switchNetwork(11155111)} className="panel-glass p-2 rounded text-sm hover:bg-white/10">Switch to Sepolia</button>
                  <button onClick={() => switchNetwork(97)} className="panel-glass p-2 rounded text-sm hover:bg-white/10">Switch to BSC Testnet</button>
                  <button onClick={() => switchNetwork(7001)} className="panel-glass p-2 rounded text-sm hover:bg-white/10">Switch to ZetaChain</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stake From Network</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      className={`py-2 px-2 rounded-lg border text-xs sm:text-sm transition-all ${currentNetwork.id === 11155111 ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                      onClick={() => switchNetwork(11155111)}
                    >
                      Sepolia
                    </button>
                    <button 
                      className={`py-2 px-2 rounded-lg border text-xs sm:text-sm transition-all ${currentNetwork.id === 97 ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                      onClick={() => switchNetwork(97)}
                    >
                      BSC Testnet
                    </button>
                    <button 
                      className={`py-2 px-2 rounded-lg border text-xs sm:text-sm transition-all ${currentNetwork.id === 7001 ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                      onClick={() => switchNetwork(7001)}
                    >
                      ZetaChain
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      className={`py-3 px-4 rounded-xl border transition-all ${selectedAsset === 'native' ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                      onClick={() => setSelectedAsset('native')}
                    >
                      Native ({currentNetwork.nativeSymbol})
                    </button>
                    <button 
                      className={`py-3 px-4 rounded-xl border transition-all ${selectedAsset === 'usdc' ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                      onClick={() => setSelectedAsset('usdc')}
                    >
                      USDC
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-[#1c1c1e] border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue transition-all font-mono"
                    />
                    <div className="absolute right-4 top-3 text-gray-400 font-mono">
                      {selectedAsset === 'native' ? currentNetwork.nativeSymbol : 'USDC'}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1c1c1e] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Transaction Type</span>
                    <span className="text-white font-medium">
                      {currentNetwork.id === selectedPool.chainId ? 'Local Staking' : 'Cross-Chain Staking'}
                    </span>
                  </div>
                  {currentNetwork.id !== selectedPool.chainId && selectedAsset === 'usdc' && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400">
                        Cross-chain staking with custom USDC is currently unsupported by the ZetaChain Gateway. Please use Native tokens for cross-chain stakes.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleStake}
                  disabled={loading || !amount || (currentNetwork.id !== selectedPool.chainId && selectedAsset === 'usdc')}
                  className="w-full bg-action-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(0,102,204,0.2)] flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      {selectedAsset === 'usdc' ? 'Approve & Stake' : 'Stake Now'} <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawStake && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-dark border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setWithdrawStake(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-semibold mb-2">Withdraw Stake</h2>
            <p className="text-sm text-gray-400 mb-6">Your stake is securely held on {NETWORKS[withdrawStake.pool.chainId as keyof typeof NETWORKS]?.name}.</p>

            {currentNetwork?.id !== withdrawStake.pool.chainId ? (
               <div className="text-center py-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                 <p className="text-yellow-400 mb-4 text-sm">To initiate the withdrawal, you must interact directly with the network where your stake is deployed.</p>
                 <button 
                   onClick={() => switchNetwork(withdrawStake.pool.chainId)} 
                   className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold w-full transition-colors"
                 >
                   Switch to {NETWORKS[withdrawStake.pool.chainId as keyof typeof NETWORKS]?.name}
                 </button>
               </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#1c1c1e] p-4 rounded-xl border border-[rgba(255,255,255,0.05)] grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400">Principal</span>
                    <p className="text-lg font-mono text-white">{Number(withdrawStake.amount).toFixed(4)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Accrued Reward</span>
                    <p className="text-lg font-mono text-action-blue">+{Number(withdrawStake.reward).toFixed(6)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Payout Network</label>
                  <p className="text-xs text-gray-500 mb-3">Choose the network where you wish to receive your principal and reward in its native token.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[11155111, 97, 7001].map(nId => (
                      <button 
                        key={nId}
                        className={`py-3 px-4 rounded-xl border text-left flex justify-between items-center transition-all ${targetNetworkId === nId ? 'border-action-blue bg-action-blue/10 text-white' : 'border-gray-700 bg-[#1c1c1e] text-gray-400 hover:border-gray-500'}`}
                        onClick={() => setTargetNetworkId(nId)}
                      >
                        <span className="font-medium">{NETWORKS[nId as keyof typeof NETWORKS].name}</span>
                        <span className="text-xs font-mono">{NETWORKS[nId as keyof typeof NETWORKS].nativeSymbol}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1c1c1e] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Routing Mode</span>
                    <span className="text-white font-medium">
                      {targetNetworkId === withdrawStake.pool.chainId ? 'Local Direct Payout' : 'Omnichain Bridge Routing'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-action-blue to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      Confirm Withdrawal <LogOut className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
