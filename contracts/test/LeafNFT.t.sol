// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LeafNFT.sol";

contract LeafNFTTest is Test {
    LeafNFT public leafNFT;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        leafNFT = new LeafNFT();
    }

    function testCreateLeaf() public {
        uint256 leafId = leafNFT.createLeaf(
            user1,
            "AI Twin",
            "I love crypto and AI",
            0.01 ether
        );

        assertEq(leafId, 1);
        assertEq(leafNFT.ownerOf(leafId), user1);

        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertEq(leaf.name, "AI Twin");
        assertEq(leaf.personalityNote, "I love crypto and AI");
        assertEq(leaf.pricePerMessage, 0.01 ether);
        assertTrue(leaf.isActive);
        assertEq(leaf.totalMessages, 0);
    }

    function testUpdateLeaf() public {
        uint256 leafId = leafNFT.createLeaf(
            user1,
            "AI Twin",
            "I love crypto",
            0.01 ether
        );

        vm.prank(user1);
        leafNFT.updateLeaf(
            leafId,
            "I love crypto and DeFi",
            0.02 ether
        );

        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertEq(leaf.personalityNote, "I love crypto and DeFi");
        assertEq(leaf.pricePerMessage, 0.02 ether);
    }

    function testCannotUpdateLeafIfNotOwner() public {
        uint256 leafId = leafNFT.createLeaf(
            user1,
            "AI Twin",
            "I love crypto",
            0.01 ether
        );

        vm.prank(user2);
        vm.expectRevert("Not the leaf owner");
        leafNFT.updateLeaf(
            leafId,
            "New note",
            0.02 ether
        );
    }

    function testSetActiveStatus() public {
        uint256 leafId = leafNFT.createLeaf(
            user1,
            "AI Twin",
            "I love crypto",
            0.01 ether
        );

        leafNFT.setActiveStatus(leafId, false);

        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertFalse(leaf.isActive);
    }

    function testIncrementMessageCount() public {
        uint256 leafId = leafNFT.createLeaf(
            user1,
            "AI Twin",
            "I love crypto",
            0.01 ether
        );

        leafNFT.incrementMessageCount(leafId);
        leafNFT.incrementMessageCount(leafId);

        LeafNFT.Leaf memory leaf = leafNFT.getLeaf(leafId);
        assertEq(leaf.totalMessages, 2);
    }

    function testTotalLeaves() public {
        assertEq(leafNFT.totalLeaves(), 0);

        leafNFT.createLeaf(user1, "Leaf 1", "Note 1", 0.01 ether);
        assertEq(leafNFT.totalLeaves(), 1);

        leafNFT.createLeaf(user2, "Leaf 2", "Note 2", 0.02 ether);
        assertEq(leafNFT.totalLeaves(), 2);
    }
}
