// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CertificateVerification
 * @dev Store and verify certificates on blockchain with IPFS integration
 * @notice Fixed: No naming conflicts between functions and identifiers
 */
contract CertificateVerification {

    // ---------------------
    // Certificate Structure
    // ---------------------
    struct Certificate {
        bool isValid;
        address issuer;
        uint256 issuedAt;
        string ipfsCID;
    }

    // Mapping: certificate hash => Certificate details
    mapping(bytes32 => Certificate) private certificates;

    // Statistics
    uint256 public totalIssued;
    uint256 public totalRevoked;

    // ---------------------
    // Events
    // ---------------------
    
    event CertificateIssued(
        bytes32 indexed certHash, 
        address indexed issuer, 
        string ipfsCID
    );

    event CertificateRevoked(
        bytes32 indexed certHash
    );

    // ---------------------
    // Modifiers
    // ---------------------
    
    modifier validHash(bytes32 certHash) {
        require(certHash != bytes32(0), "Invalid certificate hash");
        _;
    }

    modifier validCID(string memory ipfsCID) {
        require(bytes(ipfsCID).length > 0, "Invalid IPFS CID");
        _;
    }

    modifier certExists(bytes32 certHash) {
        require(certificates[certHash].isValid, "Certificate does not exist or has been revoked");
        _;
    }

    modifier onlyIssuer(bytes32 certHash) {
        require(
            certificates[certHash].issuer == msg.sender,
            "Not authorized: only issuer can revoke"
        );
        _;
    }

    // ---------------------
    // Constructor
    // ---------------------
    
    constructor() {
        totalIssued = 0;
        totalRevoked = 0;
    }

    // ---------------------
    // Main Functions
    // ---------------------

    /**
     * @dev Issue a new certificate
     * @param certHash SHA-256 hash of the certificate PDF
     * @param ipfsCID IPFS Content Identifier where the certificate is stored
     */
    function issueCertificate(bytes32 certHash, string memory ipfsCID) 
        public 
        validHash(certHash)
        validCID(ipfsCID)
    {
        require(!certificates[certHash].isValid, "Certificate already issued");
        require(certificates[certHash].issuer == address(0), "Certificate was previously issued");

        certificates[certHash] = Certificate({
            isValid: true,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            ipfsCID: ipfsCID
        });

        totalIssued++;

        emit CertificateIssued(certHash, msg.sender, ipfsCID);
    }

    /**
     * @dev Verify a certificate's validity and get its details
     * @param certHash SHA-256 hash of the certificate to verify
     * @return validity Whether the certificate is valid
     * @return certIssuer Address of the certificate issuer
     * @return issueTimestamp Timestamp when the certificate was issued
     * @return storageCID IPFS CID of the certificate file
     */
    function verifyCertificate(bytes32 certHash)
        public
        view
        validHash(certHash)
        returns (
            bool validity,
            address certIssuer,
            uint256 issueTimestamp,
            string memory storageCID
        )
    {
        Certificate memory cert = certificates[certHash];
        return (cert.isValid, cert.issuer, cert.issuedAt, cert.ipfsCID);
    }

    /**
     * @dev Revoke a certificate (only by original issuer)
     * @param certHash SHA-256 hash of the certificate to revoke
     */
    function revokeCertificate(bytes32 certHash) 
        public 
        validHash(certHash)
        certExists(certHash)
        onlyIssuer(certHash)
    {
        certificates[certHash].isValid = false;
        totalRevoked++;

        emit CertificateRevoked(certHash);
    }

    // ---------------------
    // Query Functions
    // ---------------------

    /**
     * @dev Check if a certificate exists and is valid
     * @param certHash SHA-256 hash of the certificate
     * @return bool True if certificate is valid
     */
    function checkValidity(bytes32 certHash) 
        public 
        view 
        returns (bool) 
    {
        return certificates[certHash].isValid;
    }

    /**
     * @dev Get the issuer of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return address The issuer's address
     */
    function getIssuerAddress(bytes32 certHash)
        public
        view
        returns (address)
    {
        return certificates[certHash].issuer;
    }

    /**
     * @dev Get the IPFS CID of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return string The IPFS CID
     */
    function getStorageCID(bytes32 certHash) 
        public 
        view 
        returns (string memory) 
    {
        return certificates[certHash].ipfsCID;
    }

    /**
     * @dev Get the issuance timestamp of a certificate
     * @param certHash SHA-256 hash of the certificate
     * @return uint256 The timestamp
     */
    function getIssueTimestamp(bytes32 certHash) 
        public 
        view 
        returns (uint256) 
    {
        return certificates[certHash].issuedAt;
    }

    /**
     * @dev Get statistics about the contract
     * @return issued Total certificates issued
     * @return revoked Total certificates revoked
     * @return active Total active certificates
     */
    function getStatistics()
        public
        view
        returns (
            uint256 issued,
            uint256 revoked,
            uint256 active
        )
    {
        return (totalIssued, totalRevoked, totalIssued - totalRevoked);
    }

    /**
     * @dev Get complete certificate information
     * @param certHash SHA-256 hash of the certificate
     * @return validity Whether the certificate is currently valid
     * @return certIssuer The address that issued the certificate
     * @return issueTimestamp The timestamp when issued
     * @return storageCID The IPFS CID
     * @return wasIssued Whether the certificate was ever issued
     */
    function getCertificateDetails(bytes32 certHash)
        public
        view
        returns (
            bool validity,
            address certIssuer,
            uint256 issueTimestamp,
            string memory storageCID,
            bool wasIssued
        )
    {
        Certificate memory cert = certificates[certHash];
        bool everIssued = cert.issuer != address(0);
        return (cert.isValid, cert.issuer, cert.issuedAt, cert.ipfsCID, everIssued);
    }

    /**
     * @dev Check if a certificate was ever issued (even if now revoked)
     * @param certHash SHA-256 hash of the certificate
     * @return bool True if certificate was ever issued
     */
    function wasEverIssued(bytes32 certHash)
        public
        view
        returns (bool)
    {
        return certificates[certHash].issuer != address(0);
    }
}