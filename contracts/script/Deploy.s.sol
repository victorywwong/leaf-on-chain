// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LeafNFT.sol";
import "../src/PaymentGateway.sol";

contract DeployScript is Script {
    function run() external {
        // Read environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy LeafNFT
        LeafNFT leafNFT = new LeafNFT();
        console.log("LeafNFT deployed at:", address(leafNFT));

        // Deploy PaymentGateway
        PaymentGateway gateway = new PaymentGateway(
            address(leafNFT),
            payable(treasury)
        );
        console.log("PaymentGateway deployed at:", address(gateway));

        // Set gateway address in LeafNFT
        leafNFT.setGateway(address(gateway));
        console.log("Gateway address set in LeafNFT");

        // Create a demo leaf (optional - comment out if not needed)
        uint256 leafId = leafNFT.createLeaf(
            msg.sender, // Deploy to deployer address
            "Demo Leaf",
            "I'm interested in crypto, AI, and building cool products. I'm excited about decentralization and practical web3 applications.",
            0.001 ether // 0.001 ETH per message (~$2-3)
        );
        console.log("Demo Leaf created with ID:", leafId);

        vm.stopBroadcast();

        // Output deployment addresses for frontend
        console.log("\n=== Deployment Summary ===");
        console.log("LeafNFT:", address(leafNFT));
        console.log("PaymentGateway:", address(gateway));
        console.log("Demo Leaf ID:", leafId);
        console.log("Treasury:", treasury);
    }
}
