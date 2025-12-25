// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CertificateVerification
 * @dev Smart contract for issuing, verifying, and revoking digital certificates
 * @notice This contract allows authorized users to issue certificates on the blockchain
 * and anyone to verify their authenticity
 */
contract CertificateVerification {

    // ---------------------
    // State Variables
    // ---------------------
    
    /**
     * @dev Structure to store certificate information
     */
    struct Certificate {
        bool isValid;           // Whether the certificate is currently valid
        address issuer;         // Address of the account that issued the certificate
        uint256 issuedAt;       // Timestamp when the certificate was issued
    }

    /**
     * @dev Mapping from certificate hash to Certificate struct
     * The key is a bytes32 hash generated from the PDF content
     */
    mapping(bytes32 => Certificate) private certificates;

    /**
     * @dev Counter to track total certificates issued
     */
    uint256 public totalCertificatesIssued;

    /**
     * @dev Counter to track total certificates revoked
     */
    uint256 public totalCertificatesRevoked;

    // ---------------------
    // Events
    // ---------------------
    
    /**
     * @dev Emitted when a new certificate is issued
     * @param certHash The hash of the certificate
     * @param issuer The address that issued the certificate
     * @param timestamp The time when the certificate was issued
     */
    event CertificateIssued(
        bytes32 indexed certHash,
        address indexed issuer,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a certificate is revoked
     * @param certHash The hash of the revoked certificate
     * @param revokedBy The address that revoked the certificate
     * @param timestamp The time when the certificate was revoked
     */
    event CertificateRevoked(
        bytes32 indexed certHash,
        address indexed revokedBy,
        uint256 timestamp
    );

    // ---------------------
    // Modifiers
    // ---------------------
    
    /**
     * @dev Ensures the certificate hash is not empty
     */
    modifier validHash(bytes32 certHash) {
        require(certHash != bytes32(0), "Invalid certificate hash: cannot be zero");
        _;
    }

    /**
     * @dev Ensures the certificate exists and is valid
     */
    modifier certificateExists(bytes32 certHash) {
        require(certificates[certHash].isValid, "Certificate does not exist or has been revoked");
        _;
    }

    /**
     * @dev Ensures only the issuer can revoke the certificate
     */
    modifier onlyIssuer(bytes32 certHash) {
        require(
            certificates[certHash].issuer == msg.sender,
            "Not authorized: only the issuer can revoke this certificate"
        );
        _;
    }

    // ---------------------
    // Constructor
    // ---------------------
    
    /**
     * @dev Constructor - initializes counters
     */
    constructor() {
        totalCertificatesIssued = 0;
        totalCertificatesRevoked = 0;
    }

    // ---------------------
    // Main Functions
    // ---------------------

    /**
     * @dev Issue a new certificate
     * @param certHash The SHA-256 hash of the certificate PDF
     * @notice This function can be called by anyone to issue a certificate
     * @notice The certificate hash must be unique (not previously issued)
     */
    function issueCertificate(bytes32 certHash) 
        public 
        validHash(certHash) 
    {
        require(!certificates[certHash].isValid, "Certificate already issued");
        require(certificates[certHash].issuer == address(0), "Certificate was previously issued and revoked");

        certificates[certHash] = Certificate({
            isValid: true,
            issuer: msg.sender,
            issuedAt: block.timestamp
        });

        totalCertificatesIssued++;

        emit CertificateIssued(certHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a certificate's authenticity and get its details
     * @param certHash The hash of the certificate to verify
     * @return isValid Whether the certificate is currently valid
     * @return issuer The address that issued the certificate
     * @return issuedAt The timestamp when the certificate was issued
     * @notice This is a view function and doesn't cost gas
     */
    function verifyCertificate(bytes32 certHash)
        public
        view
        validHash(certHash)
        returns (
            bool isValid,
            address issuer,
            uint256 issuedAt
        )
    {
        Certificate memory cert = certificates[certHash];
        return (cert.isValid, cert.issuer, cert.issuedAt);
    }

    /**
     * @dev Revoke a certificate
     * @param certHash The hash of the certificate to revoke
     * @notice Only the original issuer can revoke their certificate
     * @notice Once revoked, the certificate cannot be reinstated
     */
    function revokeCertificate(bytes32 certHash)
        public
        validHash(certHash)
        certificateExists(certHash)
        onlyIssuer(certHash)
    {
        // Mark certificate as invalid
        certificates[certHash].isValid = false;
        
        totalCertificatesRevoked++;

        emit CertificateRevoked(certHash, msg.sender, block.timestamp);
    }

    // ---------------------
    // Query Functions
    // ---------------------

    /**
     * @dev Check if a certificate exists and is valid (simple check)
     * @param certHash The hash of the certificate
     * @return bool True if certificate is valid, false otherwise
     */
    function isCertificateValid(bytes32 certHash) 
        public 
        view 
        returns (bool) 
    {
        return certificates[certHash].isValid;
    }

    /**
     * @dev Get the issuer of a certificate
     * @param certHash The hash of the certificate
     * @return address The address that issued the certificate
     */
    function getCertificateIssuer(bytes32 certHash)
        public
        view
        returns (address)
    {
        return certificates[certHash].issuer;
    }

    /**
     * @dev Get the timestamp when certificate was issued
     * @param certHash The hash of the certificate
     * @return uint256 The timestamp when the certificate was issued
     */
    function getCertificateIssuedAt(bytes32 certHash)
        public
        view
        returns (uint256)
    {
        return certificates[certHash].issuedAt;
    }

    /**
     * @dev Get statistics about the contract
     * @return issued Total number of certificates issued
     * @return revoked Total number of certificates revoked
     * @return active Total number of currently active certificates
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
        return (
            totalCertificatesIssued,
            totalCertificatesRevoked,
            totalCertificatesIssued - totalCertificatesRevoked
        );
    }

    // ---------------------
    // Helper Functions
    // ---------------------

    /**
     * @dev Get complete certificate information
     * @param certHash The hash of the certificate
     * @return isValid Whether the certificate is currently valid
     * @return issuer The address that issued the certificate
     * @return issuedAt The timestamp when the certificate was issued
     * @return certExists Whether the certificate was ever issued
     */
    function getCertificateDetails(bytes32 certHash)
        public
        view
        returns (
            bool isValid,
            address issuer,
            uint256 issuedAt,
            bool certExists
        )
    {
        Certificate memory cert = certificates[certHash];
        bool wasEverIssued = cert.issuer != address(0);
        return (cert.isValid, cert.issuer, cert.issuedAt, wasEverIssued);
    }
}
