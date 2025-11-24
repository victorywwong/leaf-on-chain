// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LeafNFT
 * @dev ERC-721 NFT representing AI digital replicas ("leaves")
 * Each leaf has a personality note and can be chatted with for a price per message
 */
contract LeafNFT is ERC721, Ownable {
    struct Leaf {
        string name;
        string personalityNote;     // Short note describing interests/personality
        uint256 pricePerMessage;    // Price in wei to chat with this leaf
        bool isActive;              // false = hibernating (insufficient funds)
        uint256 createdAt;
        uint256 totalMessages;
    }

    // Mapping from leafId to Leaf data
    mapping(uint256 => Leaf) public leaves;

    // Counter for leaf IDs
    uint256 private _nextLeafId;

    // Gateway contract address (can increment message count and set active status)
    address public gateway;

    // Creation fee for public leaf creation (0.01 ETH)
    uint256 public constant CREATION_FEE = 0.01 ether;

    // Events
    event GatewayUpdated(address indexed oldGateway, address indexed newGateway);
    event LeafCreated(
        uint256 indexed leafId,
        address indexed owner,
        string name,
        uint256 pricePerMessage
    );

    event LeafUpdated(
        uint256 indexed leafId,
        string personalityNote,
        uint256 pricePerMessage
    );

    event LeafStatusChanged(
        uint256 indexed leafId,
        bool isActive
    );

    event MessageCountIncremented(
        uint256 indexed leafId,
        uint256 newCount
    );

    // Modifier to allow only owner or gateway
    modifier onlyOwnerOrGateway() {
        require(msg.sender == owner() || msg.sender == gateway, "Not authorized");
        _;
    }

    constructor() ERC721("Leaf", "LEAF") Ownable(msg.sender) {
        _nextLeafId = 1;
    }

    /**
     * @dev Set gateway contract address
     */
    function setGateway(address _gateway) external onlyOwner {
        address oldGateway = gateway;
        gateway = _gateway;
        emit GatewayUpdated(oldGateway, _gateway);
    }

    /**
     * @dev Create a new leaf NFT
     * @param to Address to mint the leaf to
     * @param name Name of the leaf
     * @param personalityNote Short description of personality/interests
     * @param pricePerMessage Price in wei to send one message to this leaf
     */
    function createLeaf(
        address to,
        string memory name,
        string memory personalityNote,
        uint256 pricePerMessage
    ) external onlyOwner returns (uint256) {
        uint256 leafId = _nextLeafId++;

        _safeMint(to, leafId);

        leaves[leafId] = Leaf({
            name: name,
            personalityNote: personalityNote,
            pricePerMessage: pricePerMessage,
            isActive: true,
            createdAt: block.timestamp,
            totalMessages: 0
        });

        emit LeafCreated(leafId, to, name, pricePerMessage);

        return leafId;
    }

    /**
     * @dev Create a new leaf NFT (public version)
     * Anyone can create a leaf by paying the creation fee
     * @param name Name of the leaf
     * @param personalityNote Short description of personality/interests
     * @param pricePerMessage Price in wei to send one message to this leaf
     */
    function createLeafPublic(
        string memory name,
        string memory personalityNote,
        uint256 pricePerMessage
    ) external payable returns (uint256) {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(bytes(name).length >= 3 && bytes(name).length <= 50, "Name must be 3-50 characters");
        require(bytes(personalityNote).length >= 10 && bytes(personalityNote).length <= 500, "Note must be 10-500 characters");
        require(pricePerMessage >= 0.0001 ether, "Price too low (min 0.0001 ETH)");

        uint256 leafId = _nextLeafId++;

        _safeMint(msg.sender, leafId);  // Mint to caller

        leaves[leafId] = Leaf({
            name: name,
            personalityNote: personalityNote,
            pricePerMessage: pricePerMessage,
            isActive: true,
            createdAt: block.timestamp,
            totalMessages: 0
        });

        // Transfer creation fee to contract owner
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Fee transfer failed");

        emit LeafCreated(leafId, msg.sender, name, pricePerMessage);

        return leafId;
    }

    /**
     * @dev Update leaf personality note and price
     * Can only be called by the owner of the leaf
     */
    function updateLeaf(
        uint256 leafId,
        string memory personalityNote,
        uint256 pricePerMessage
    ) external {
        require(ownerOf(leafId) == msg.sender, "Not the leaf owner");

        leaves[leafId].personalityNote = personalityNote;
        leaves[leafId].pricePerMessage = pricePerMessage;

        emit LeafUpdated(leafId, personalityNote, pricePerMessage);
    }

    /**
     * @dev Set active status (for hibernation)
     * Can be called by contract owner or payment gateway
     */
    function setActiveStatus(uint256 leafId, bool active) external onlyOwnerOrGateway {
        require(_ownerOf(leafId) != address(0), "Leaf does not exist");
        leaves[leafId].isActive = active;
        emit LeafStatusChanged(leafId, active);
    }

    /**
     * @dev Increment message count (called by PaymentGateway)
     */
    function incrementMessageCount(uint256 leafId) external onlyOwnerOrGateway {
        require(_ownerOf(leafId) != address(0), "Leaf does not exist");
        leaves[leafId].totalMessages++;
        emit MessageCountIncremented(leafId, leaves[leafId].totalMessages);
    }

    /**
     * @dev Get leaf data
     */
    function getLeaf(uint256 leafId) external view returns (Leaf memory) {
        require(_ownerOf(leafId) != address(0), "Leaf does not exist");
        return leaves[leafId];
    }

    /**
     * @dev Get total number of leaves minted
     */
    function totalLeaves() external view returns (uint256) {
        return _nextLeafId - 1;
    }
}
