// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LeafNFT.sol";
import "../src/PaymentGateway.sol";

contract PaymentGatewayTest is Test {
    LeafNFT public leafNFT;
    PaymentGateway public gateway;
    address public owner;
    address public treasury;
    address public leafOwner;
    address public user;

    uint256 public leafId;

    function setUp() public {
        owner = address(this);
        treasury = address(0x1);
        leafOwner = address(0x2);
        user = address(0x3);

        // Deploy contracts
        leafNFT = new LeafNFT();
        gateway = new PaymentGateway(address(leafNFT), payable(treasury));

        // Set gateway address in LeafNFT to allow it to increment message count
        leafNFT.setGateway(address(gateway));

        // Create a leaf
        leafId = leafNFT.createLeaf(
            leafOwner,
            "Test Leaf",
            "I love testing",
            0.01 ether
        );

        // Fund user account
        vm.deal(user, 10 ether);
    }

    function testPayForMessage() public {
        uint256 price = 0.01 ether;
        uint256 platformFee = (price * 3000) / 10000; // 30%
        uint256 ownerAmount = price - platformFee;

        uint256 leafOwnerBalanceBefore = leafOwner.balance;
        uint256 treasuryBalanceBefore = treasury.balance;

        vm.prank(user);
        gateway.payForMessage{value: price}(leafId);

        // Check balances
        assertEq(leafOwner.balance, leafOwnerBalanceBefore + ownerAmount);
        assertEq(treasury.balance, treasuryBalanceBefore + platformFee);

        // Check message count incremented
        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertEq(leaf.totalMessages, 1);
    }

    function testCannotPayInsufficientAmount() public {
        vm.prank(user);
        vm.expectRevert("Insufficient payment");
        gateway.payForMessage{value: 0.005 ether}(leafId);
    }

    function testCannotPayToInactiveLeaf() public {
        // Deactivate leaf
        leafNFT.setActiveStatus(leafId, false);

        vm.prank(user);
        vm.expectRevert("Leaf is hibernating");
        gateway.payForMessage{value: 0.01 ether}(leafId);
    }

    function testDonateToLeaf() public {
        uint256 donationAmount = 0.5 ether;
        uint256 leafOwnerBalanceBefore = leafOwner.balance;

        vm.prank(user);
        gateway.donateToLeaf{value: donationAmount}(leafId);

        // Entire amount goes to leaf owner (no platform fee)
        assertEq(leafOwner.balance, leafOwnerBalanceBefore + donationAmount);
    }

    function testGetPaymentInfo() public {
        (
            uint256 pricePerMessage,
            uint256 platformFee,
            uint256 ownerAmount,
            bool isActive
        ) = gateway.getPaymentInfo(leafId);

        assertEq(pricePerMessage, 0.01 ether);
        assertEq(platformFee, 0.003 ether); // 30%
        assertEq(ownerAmount, 0.007 ether); // 70%
        assertTrue(isActive);
    }

    function testUpdateTreasury() public {
        address newTreasury = address(0x999);

        gateway.updateTreasury(payable(newTreasury));

        assertEq(address(gateway.treasury()), newTreasury);
    }

    function testMultiplePayments() public {
        uint256 price = 0.01 ether;

        vm.startPrank(user);
        gateway.payForMessage{value: price}(leafId);
        gateway.payForMessage{value: price}(leafId);
        gateway.payForMessage{value: price}(leafId);
        vm.stopPrank();

        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertEq(leaf.totalMessages, 3);
    }
}
