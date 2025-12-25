//CertificateVerification.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CertificateVerification
 * @dev Store and verify certificates on blockchain with IPFS integration
 */
contract CertificateVerification {

    // ---------------------
    // Certificate Structure
    // ---------------------
    struct Certificate {
        bool isValid;           // Certificate validity status
        address issuer;         // Address of the certificate issuer
        uint256 issuedAt;       // Timestamp when certificate was issued
        string ipfsCID;         // IPFS Content Identifier for the certificate file
    }

    // Mapping: certificate hash => Certificate details
    mapping(bytes32 => Certificate) private certificates;

    // ---------------------
    // Events
    // ---------------------
    
    /**
     * @dev Emitted when a new certificate is issued
     * @param certHash The hash of the certificate
     * @param issuer Address of the issuer
     * @param ipfsCID IPFS CID where the certificate is stored
     */
    event CertificateIssued(
        bytes32 indexed certHash, 
        address indexed issuer, 
        string ipfsCID
    );

    /**
     * @dev Emitted when a certificate is revoked
     * @param certHash The hash of the revoked certificate
     */
    event CertificateRevoked(bytes32 indexed certHash);

    // ---------------------
    // Modifiers
    // ---------------------
    
    /**
     * @dev Validates that the certificate hash is not empty
     */
    modifier validHash(bytes32 certHash) {
        require(certHash != bytes32(0), "Invalid certificate hash");
        _;
    }

    /**
     * @dev Validates that the IPFS CID is not empty
     */
    modifier validCID(string memory ipfsCID) {
        require(bytes(ipfsCID).length > 0, "Invalid IPFS CID");
        _;
    }

    // ---------------------
    // Main Functions
    // ---------------------

    /**
     * @dev Issue a new certificate
     * @param certHash SHA-256 hash of the certificate PDF
     * @param ipfsCID IPFS Content Identifier where the certificate is stored
     * 
     * Requirements:
     * - certHash must not be zero
     * - ipfsCID must not be empty
     * - Certificate must not already exist
     */
    function issueCertificate(bytes32 certHash, string memory ipfsCID) 
        public 
        validHash(certHash)
        validCID(ipfsCID)
    {
        require(!certificates[certHash].isValid, "Certificate already issued");

        certificates[certHash] = Certificate({
            isValid: true,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            ipfsCID: ipfsCID
        });

        emit CertificateIssued(certHash, msg.sender, ipfsCID);
    }

    /**
     * @dev Verify a certificate's validity and get its details
     * @param certHash SHA-256 hash of the certificate to verify
     * @return isValid Whether the certificate is valid
     * @return issuer Address of the certificate issuer
     * @return issuedAt Timestamp when the certificate was issued
     * @return ipfsCID IPFS CID of the certificate file
     */
    function verifyCertificate(bytes32 certHash)
        public
        view
        returns (
            bool isValid,
            address issuer,
            uint256 issuedAt,
            string memory ipfsCID
        )
    {
        Certificate memory cert = certificates[certHash];
        return (cert.isValid, cert.issuer, cert.issuedAt, cert.ipfsCID);
    }

    /**
     * @dev Revoke a certificate (only by the original issuer)
     * @param certHash SHA-256 hash of the certificate to revoke
     * 
     * Requirements:
     * - Certificate must exist
     * - Only the original issuer can revoke the certificate
     */
    function revokeCertificate(bytes32 certHash) 
        public 
        validHash(certHash)
    {
        require(certificates[certHash].isValid, "Certificate does not exist");
        require(certificates[certHash].issuer == msg.sender, "Not authorized");

        // Delete the certificate data
        delete certificates[certHash];
        
        emit CertificateRevoked(certHash);
    }

    // ---------------------
    // Additional Helper Functions
    // ---------------------

    /**
     * @dev Check if a certificate exists
     * @param certHash SHA-256 hash of the certificate
     * @return bool True if certificate exists and is valid
     */
    function certificateExists(bytes32 certHash) 
        public 
        view 
        returns (bool) 
    {
        return certificates[certHash].isValid;
    }

    /**
     * @dev Get the issuer of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return address The issuer's address (returns zero address if certificate doesn't exist)
     */
    function getCertificateIssuer(bytes32 certHash) 
        public 
        view 
        returns (address) 
    {
        return certificates[certHash].issuer;
    }

    /**
     * @dev Get the IPFS CID of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return string The IPFS CID (returns empty string if certificate doesn't exist)
     */
    function getCertificateIPFS(bytes32 certHash) 
        public 
        view 
        returns (string memory) 
    {
        return certificates[certHash].ipfsCID;
    }

    /**
     * @dev Get the issuance timestamp of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return uint256 The timestamp (returns 0 if certificate doesn't exist)
     */
    function getCertificateTimestamp(bytes32 certHash) 
        public 
        view 
        returns (uint256) 
    {
        return certificates[certHash].issuedAt;
    }
}

