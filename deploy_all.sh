#!/bin/bash
set -e

echo "=== Deploying to ZetaChain ==="
# Deploy USDC
export USDC_ADDRESS_ZETA=$(npx hardhat run scripts/deploy-usdc.ts --network zetaTestnet | grep 'deployed successfully to:' | awk '{print $NF}')
echo "ZetaChain USDC Address: $USDC_ADDRESS_ZETA"
export ZETA_USDC_ADDRESS=$USDC_ADDRESS_ZETA

# Deploy StakingRouter
export ROUTER_ADDRESS=$(npx hardhat run scripts/deploy-staking-zevm.ts --network zetaTestnet | grep 'deployed to:' | awk '{print $NF}')
echo "Zeta Router Address: $ROUTER_ADDRESS"
export ZETA_ROUTER_ADDRESS=$ROUTER_ADDRESS

# Deploy ZetaNativeStaking and configure
export STAKING_ADDRESS_ZETA=$(npx hardhat run scripts/deploy-native-zevm.ts --network zetaTestnet | grep 'deployed successfully to:' | awk '{print $NF}')
echo "Zeta Native Staking Address: $STAKING_ADDRESS_ZETA"


echo "=== Deploying to BSC Testnet ==="
# Deploy USDC
export USDC_ADDRESS_BSC=$(npx hardhat run scripts/deploy-usdc.ts --network bscTestnet | grep 'deployed successfully to:' | awk '{print $NF}')
echo "BSC USDC Address: $USDC_ADDRESS_BSC"
export USDC_ADDRESS=$USDC_ADDRESS_BSC
export GATEWAY_ADDRESS=0x0c487a766110c85d301d96e33579c5b317fa4995

# Deploy Staking Edge
export STAKING_ADDRESS_BSC=$(npx hardhat run scripts/deploy-staking-edge.ts --network bscTestnet | grep 'deployed to:' | awk '{print $NF}')
echo "BSC Staking Address: $STAKING_ADDRESS_BSC"
export STAKING_ADDRESS=$STAKING_ADDRESS_BSC

# Configure Pools
npx hardhat run scripts/configure-pools.ts --network bscTestnet


echo "=== Deploying to Sepolia ==="
# Deploy USDC
export USDC_ADDRESS_SEPOLIA=$(npx hardhat run scripts/deploy-usdc.ts --network sepolia | grep 'deployed successfully to:' | awk '{print $NF}')
echo "Sepolia USDC Address: $USDC_ADDRESS_SEPOLIA"
export USDC_ADDRESS=$USDC_ADDRESS_SEPOLIA
export GATEWAY_ADDRESS=0x0c487a766110c85d301d96e33579c5b317fa4995

# Deploy Staking Edge
export STAKING_ADDRESS_SEPOLIA=$(npx hardhat run scripts/deploy-staking-edge.ts --network sepolia | grep 'deployed to:' | awk '{print $NF}')
echo "Sepolia Staking Address: $STAKING_ADDRESS_SEPOLIA"
export STAKING_ADDRESS=$STAKING_ADDRESS_SEPOLIA

# Configure Pools
npx hardhat run scripts/configure-pools.ts --network sepolia


echo ""
echo "=== Deployment Summary ==="
echo "BSC_USDC=$USDC_ADDRESS_BSC"
echo "BSC_STAKING=$STAKING_ADDRESS_BSC"
echo "SEPOLIA_USDC=$USDC_ADDRESS_SEPOLIA"
echo "SEPOLIA_STAKING=$STAKING_ADDRESS_SEPOLIA"
echo "ZETA_USDC=$USDC_ADDRESS_ZETA"
echo "ZETA_ROUTER=$ROUTER_ADDRESS"
echo "ZETA_STAKING=$STAKING_ADDRESS_ZETA"
