# CertiChain: Blockchain-Powered Certificate Issuance & Verification System

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Blockchain](https://img.shields.io/badge/blockchain-Ethereum-purple.svg) ![React](https://img.shields.io/badge/frontend-React-61DAFB.svg) ![Node.js](https://img.shields.io/badge/backend-Node.js-339933.svg) ![IPFS](https://img.shields.io/badge/storage-IPFS-65C2CB.svg)

**CertiChain** is a secure, blockchain-based platform for issuing and verifying digital certificates. By storing certificate hashes on the blockchain, it ensures authenticity, prevents forgery, and provides instant verification, creating trust in academic and professional credentials.

Developed for **KU HackFest 2025** 🏆

---

## 📋 Table of Contents

- [CertiChain: Blockchain-Powered Certificate Issuance \& Verification System](#certichain-blockchain-powered-certificate-issuance--verification-system)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠 Tech Stack](#-tech-stack)
  - [🏗 How It Works](#-how-it-works)
    - [Workflow](#workflow)
  - [📦 Installation](#-installation)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
  - [🔐 Environment Variables](#-environment-variables)
  - [📡 API Endpoints](#-api-endpoints)
  - [📜 Smart Contract](#-smart-contract)
  - [📊 Presentation](#-presentation)
  - [📄 License](#-license)
  - [👥 Team](#-team)
  - [🙏 Acknowledgments](#-acknowledgments)
  - [📞 Contact](#-contact)

---

## ✨ Features

* **Issue Certificates**: Upload PDF certificates, generate a SHA-256 hash, and store on blockchain.
* **Decentralized Storage**: Certificate files stored securely on IPFS via Pinata.
* **QR Codes**: Automatically generate QR codes for easy certificate verification.
* **Instant Verification**: Verify certificates via PDF upload or QR code scan.
* **Revocation**: Permanently revoke certificates if needed.
* **Tamper-Proof**: Certificates cannot be altered or forged once issued.
* **Transparent & Immutable**: Blockchain ensures permanent, verifiable records.

---

## 🛠 Tech Stack

**Frontend**

* React.js
* Tailwind CSS
* Lucide React (icons)
* jsQR (QR code scanning)

**Backend**

* Node.js + Express.js
* Multer (file uploads)
* Crypto (hashing)

**Blockchain**

* Ethereum (Ganache for local testing)
* Ethers.js
* Solidity

**Storage**

* IPFS via Pinata

**Other Libraries**

* QRCode (generation)
* Axios (HTTP requests)
* dotenv (environment variables)

---

## 🏗 How It Works

```
┌─────────────────┐
│   React Frontend│
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express Backend│
│   (Port 3000)   │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────────┐ ┌──────────────┐
│  Ganache    │ │  IPFS/Pinata │
│ Blockchain  │ │   Storage    │
└─────────────┘ └──────────────┘
```

### Workflow

1. **Issue Certificate**: Upload PDF → Generate hash → Upload to IPFS → Store hash on blockchain → Generate QR code.
2. **Verify Certificate**: Upload PDF or scan QR code → Generate/extract hash → Check blockchain → Display result.
3. **Revoke Certificate**: Upload PDF or QR code → Extract hash → Mark as revoked on blockchain.

---

## 📦 Installation

### Prerequisites

* Node.js (v16+)
* npm or yarn
* Ganache (local blockchain)
* Pinata account (IPFS storage)

### Setup

1. **Clone repository**

```bash
git clone https://github.com/manusharansah/CipherSquad.git
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Start Ganache**

* Note the RPC URL (usually `http://127.0.0.1:7545`)
* Copy a private key from an account

5. **Deploy Smart Contract**

```bash
cd ../smart-contract
# Deploy via Remix, Truffle, or Hardhat
# Save the deployed contract address
```

6. **Configure environment variables** (see below)

7. **Start backend**

```bash
cd ../backend
npm start
```

8. **Start frontend**

```bash
cd ../frontend
npm start
```

9. **Open app**

* Browser: `http://localhost:3001` or `http://localhost:{port address specified in the run after npm start}`

---

## 🔐 Environment Variables

Create a `.env` file in the **backend** folder:

```env
PORT=3000
PROVIDER_URL=http://127.0.0.1:7545
PRIVATE_KEY=your_ganache_private_key
CONTRACT_ADDRESS=your_contract_address
PINATA_JWT=your_pinata_jwt
NODE_ENV=development
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/`                       | API status                   |
| POST   | `/api/issue-certificate`  | Issue new certificate        |
| POST   | `/api/verify-certificate` | Verify via PDF               |
| POST   | `/api/verify-qr`          | Verify via QR code           |
| POST   | `/api/revoke-certificate` | Revoke via PDF               |
| POST   | `/api/revoke-qr`          | Revoke via QR code           |
| GET    | `/api/certificate/:hash`  | Get certificate info by hash |

**Example: Issue Certificate**

```bash
curl -X POST http://localhost:3000/api/issue-certificate \
  -F "certificate=@certificate.pdf"
```

---

## 📜 Smart Contract

```solidity
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
```

**Functions**

* `issueCertificate`: Store hash + IPFS link
* `verifyCertificate`: Check validity & return info
* `revokeCertificate`: Mark certificate as revoked

---

## 📊 Presentation

View full project presentation: [CertiChain Presentation](https://www.canva.com/design/DAG8kS64qgE/DYwDg0qsKPW3bELZKa5MNA/edit?utm_content=DAG8kS64qgE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---


## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👥 Team

**Team CertiChain**

* [Manu Sharan Sah](https://github.com/manusharansah)
* [Gaurav Sharan Kumar](https://github.com/gauravsharankumar)
* [Pratik Shrestha](https://github.com/pratikproo)
* [Sunil Rai](https://github.com/Sunilrai1743)
---

## 🙏 Acknowledgments

* KU HackFest 2025
* Pinata for IPFS storage
* Ganache for local blockchain testing
* Open-source community for amazing tools

---

## 📞 Contact

* Email: [manu1saurabh@gmail.com](mailto:manu1saurabh@gmail.com)
* GitHub: [manusharansah/CipherSquad](https://github.com/manusharansah/CipherSquad)

---

**Made with ❤️ for KU HackFest 2025**
