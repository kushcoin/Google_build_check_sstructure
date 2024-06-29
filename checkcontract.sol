//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JointCheckContract is ReentrancyGuard {
    struct Check {
        uint256 id;
        address payer;
        address recipient;
        uint256 amount;
        bool isAccepted;
        bool isCancelled;
        bool isConfirmed;
        bytes32 agreementIPFSHash; // Store IPFS hash as bytes32
    }

    uint256 public nextCheckId;
    mapping(uint256 => Check) public checks;
    mapping(uint256 => address[]) public signers;
    mapping(uint256 => mapping(address => bool)) public hasSigned;
    mapping(uint256 => bool) public isAllSignersSigned; // Gas optimization: track if all signers have signed

    event CheckIssued(
        uint256 indexed checkId,
        address indexed payer,
        address indexed recipient,
        uint256 amount
    );

    event CheckAccepted(uint256 indexed checkId);
    event CheckCancelled(uint256 indexed checkId);
    event CheckSigned(uint256 indexed checkId, address indexed signer);
    event CheckConfirmed(uint256 indexed checkId, bytes32 agreementIPFSHash);
    event CheckRejected(uint256 indexed checkId);
    event SignerAdded(uint256 indexed checkId, address indexed signer);

    // Issue a check, payable function to receive funds
    function issueCheck(address recipient, uint256 amount) external payable {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");

        uint256 checkId = nextCheckId++;
        checks[checkId] = Check({
            id: checkId,
            payer: msg.sender,
            recipient: recipient,
            amount: amount,
            isAccepted: false,
            isCancelled: false,
            isConfirmed: false,
            agreementIPFSHash: bytes32(0) // Initialize with empty hash
        });

        emit CheckIssued(checkId, msg.sender, recipient, amount);
    }

    // Accept a check
    function acceptCheck(uint256 checkId) external {
        Check storage check = checks[checkId];
        require(
            msg.sender == check.recipient,
            "Only the recipient can accept the check"
        );
        require(!check.isAccepted, "Check already accepted");
        require(!check.isCancelled, "Check is cancelled");

        check.isAccepted = true;
        emit CheckAccepted(checkId);
    }

    // Cancel a check
    function cancelCheck(uint256 checkId) external {
        Check storage check = checks[checkId];
        require(
            msg.sender == check.payer,
            "Only the payer can cancel the check"
        );
        require(!check.isAccepted, "Cannot cancel an accepted check");

        check.isCancelled = true;
        emit CheckCancelled(checkId);
    }

    // Sign a check
    function signCheck(uint256 checkId) external {
        Check storage check = checks[checkId];
        require(!check.isCancelled, "Check is cancelled");
        require(!check.isConfirmed, "Check is already confirmed");
        require(!hasSigned[checkId][msg.sender], "Already signed");

        hasSigned[checkId][msg.sender] = true;
        emit CheckSigned(checkId, msg.sender);

        // Confirm check if all signers have signed
        if (allSignersSigned(checkId)) {
            check.isConfirmed = true;
            emit CheckConfirmed(checkId, check.agreementIPFSHash);
        }
    }

    // Add a signer to the check
    function addSigner(uint256 checkId, address signer) external {
        Check storage check = checks[checkId];
        require(msg.sender == check.payer, "Only the payer can add signers");
        require(signer != address(0), "Invalid signer address");

        signers[checkId].push(signer);
        emit SignerAdded(checkId, signer);
    }

    // Store the agreement IPFS hash
    function storeAgreement(uint256 checkId, bytes32 ipfsHash) external {
        Check storage check = checks[checkId];
        require(
            msg.sender == check.payer || msg.sender == check.recipient,
            "Only the payer or recipient can store the agreement"
        );
        require(check.isAccepted, "Check must be accepted first");
        require(!check.isCancelled, "Check is cancelled");

        check.agreementIPFSHash = ipfsHash;
        emit CheckConfirmed(checkId, ipfsHash);
    }

    // Reject a check
    function rejectCheck(uint256 checkId) external {
        Check storage check = checks[checkId];
        require(
            msg.sender == check.recipient,
            "Only the recipient can reject the check"
        );
        require(!check.isAccepted, "Check already accepted");
        require(!check.isCancelled, "Check is cancelled");

        check.isCancelled = true;
        emit CheckRejected(checkId);
    }

    // Get the list of signers for a check
    function getSigners(
        uint256 checkId
    ) external view returns (address[] memory) {
        return signers[checkId];
    }

    // Check if a signer has signed a check
    function hasSignedCheck(
        uint256 checkId,
        address signer
    ) external view returns (bool) {
        return hasSigned[checkId][signer];
    }

    // Check if all signers have signed a check
    function allSignersSigned(uint256 checkId) internal view returns (bool) {
        if (isAllSignersSigned[checkId]) {
            return true;
        }

        address[] memory checkSigners = signers[checkId];
        for (uint256 i = 0; i < checkSigners.length; i++) {
            if (!hasSigned[checkId][checkSigners[i]]) {
                return false;
            }
        }

        return true;
    }

    // Update the state to indicate all signers have signed
    function updateAllSignersSigned(uint256 checkId) internal {
        isAllSignersSigned[checkId] = true;
    }

    // Get the details of a check
    function getCheck(
        uint256 checkId
    )
        external
        view
        returns (address, address, uint256, bool, bool, bool, bytes32)
    {
        Check storage check = checks[checkId];
        return (
            check.payer,
            check.recipient,
            check.amount,
            check.isAccepted,
            check.isCancelled,
            check.isConfirmed,
            check.agreementIPFSHash
        );
    }

    // Example of using the reentrancy guard
    //function someFunctionThatCallsExternalContract() external nonReentrant {
        // ... your code ...
   // }
}
