// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LeafNFT.sol";

/**
 * @title PaymentGateway
 * @dev Handles pay-per-message payments for chatting with Leaf NFTs
 * Splits revenue: 70% to leaf owner, 30% to platform
 */
contract PaymentGateway is Ownable, ReentrancyGuard {
    LeafNFT public leafNFT;

    // Platform fee (30% = 3000 basis points out of 10000)
    uint256 public constant PLATFORM_FEE_BPS = 3000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Platform treasury address
    address payable public treasury;

    // Events
    event MessagePaid(
        uint256 indexed leafId,
        address indexed user,
        address indexed leafOwner,
        uint256 totalAmount,
        uint256 platformFee,
        uint256 ownerAmount,
        uint256 timestamp
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _leafNFT, address payable _treasury) Ownable(msg.sender) {
        require(_leafNFT != address(0), "Invalid LeafNFT address");
        require(_treasury != address(0), "Invalid treasury address");

        leafNFT = LeafNFT(_leafNFT);
        treasury = _treasury;
    }

    /**
     * @dev Pay for a message to a specific leaf
     * Splits payment: 70% to leaf owner, 30% to platform
     * @param leafId The ID of the leaf to chat with
     */
    function payForMessage(uint256 leafId) external payable nonReentrant {
        // Get leaf data
        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);

        // Verify leaf is active
        require(leaf.isActive, "Leaf is hibernating");

        // Verify payment amount
        require(msg.value >= leaf.pricePerMessage, "Insufficient payment");

        // Get leaf owner
        address leafOwner = leafNFT.ownerOf(leafId);
        require(leafOwner != address(0), "Leaf does not exist");

        // Calculate splits
        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 ownerAmount = msg.value - platformFee;

        // Transfer to leaf owner (70%)
        (bool ownerSuccess, ) = payable(leafOwner).call{value: ownerAmount}("");
        require(ownerSuccess, "Transfer to owner failed");

        // Transfer to treasury (30%)
        (bool treasurySuccess, ) = treasury.call{value: platformFee}("");
        require(treasurySuccess, "Transfer to treasury failed");

        // Increment message count in LeafNFT
        leafNFT.incrementMessageCount(leafId);

        emit MessagePaid(
            leafId,
            msg.sender,
            leafOwner,
            msg.value,
            platformFee,
            ownerAmount,
            block.timestamp
        );
    }

    /**
     * @dev Donate to a leaf owner (no platform fee)
     * @param leafId The ID of the leaf to donate to
     */
    function donateToLeaf(uint256 leafId) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");

        // Get leaf owner
        address leafOwner = leafNFT.ownerOf(leafId);
        require(leafOwner != address(0), "Leaf does not exist");

        // Transfer entire amount to leaf owner
        (bool success, ) = payable(leafOwner).call{value: msg.value}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function updateTreasury(address payable newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Get payment details for a leaf
     */
    function getPaymentInfo(uint256 leafId) external view returns (
        uint256 pricePerMessage,
        uint256 platformFee,
        uint256 ownerAmount,
        bool isActive
    ) {
        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        pricePerMessage = leaf.pricePerMessage;
        platformFee = (pricePerMessage * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        ownerAmount = pricePerMessage - platformFee;
        isActive = leaf.isActive;
    }
}
