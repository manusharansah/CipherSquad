// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
const pdf = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for PDF upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Blockchain Configuration
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Updated ABI to match your Solidity contract
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider, wallet, contract;

try {
  provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  console.log('Blockchain initialized successfully');
  console.log('Wallet address:', wallet.address);
} catch (error) {
  console.error('Blockchain initialization error:', error.message);
}

// Utility function to generate hash from PDF buffer
function generatePDFHash(pdfBuffer) {
  return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
}

// Convert hex hash to bytes32 format for smart contract
function hexToBytes32(hexString) {
  // Remove '0x' if present and ensure it's 64 characters
  const cleanHex = hexString.replace(/^0x/, '');
  return '0x' + cleanHex;
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    endpoints: {
      issue: 'POST /api/issue-certificate',
      verify: 'POST /api/verify-certificate',
      revoke: 'POST /api/revoke-certificate',
      getByHash: 'GET /api/certificate/:hash'
    }
  });
});

// Issue Certificate Endpoint
app.post('/api/issue-certificate', upload.single('certificate'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Generate hash from PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('Issuing certificate...');
    console.log('PDF Hash:', pdfHash);
    console.log('Bytes32 Hash:', bytes32Hash);

    // Send transaction to blockchain (only certHash parameter)
    const tx = await contract.issueCertificate(bytes32Hash);

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log('Transaction confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateHash: pdfHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        issuer: wallet.address
      }
    });

  } catch (error) {
    console.error('Error issuing certificate:', error);
    
    // Handle specific contract errors
    let errorMessage = 'Failed to issue certificate';
    if (error.message.includes('Certificate already issued')) {
      errorMessage = 'This certificate has already been issued on the blockchain';
    } else if (error.message.includes('Invalid certificate hash')) {
      errorMessage = 'Invalid certificate hash';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// Verify Certificate Endpoint
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Generate hash from uploaded PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('Verifying certificate...');
    console.log('PDF Hash:', pdfHash);

    // Query blockchain for certificate
    const result = await contract.verifyCertificate(bytes32Hash);
    
    // Destructure the result: [isValid, issuer, issuedAt]
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];

    if (isValid) {
      const issuedDate = new Date(Number(issuedAt) * 1000);

      res.json({
        success: true,
        message: 'Certificate is valid',
        data: {
          isValid: true,
          certificateHash: pdfHash,
          issuer: issuer,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(issuedAt)
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Certificate not found or has been revoked',
        data: {
          isValid: false,
          certificateHash: pdfHash
        }
      });
    }

  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

// Revoke Certificate Endpoint
app.post('/api/revoke-certificate', upload.single('certificate'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Generate hash from PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('Revoking certificate...');
    console.log('PDF Hash:', pdfHash);

    // Send transaction to blockchain
    const tx = await contract.revokeCertificate(bytes32Hash);

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log('Transaction confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        certificateHash: pdfHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (error) {
    console.error('Error revoking certificate:', error);
    
    // Handle specific contract errors
    let errorMessage = 'Failed to revoke certificate';
    if (error.message.includes('Certificate does not exist')) {
      errorMessage = 'Certificate does not exist';
    } else if (error.message.includes('Not authorized')) {
      errorMessage = 'You are not authorized to revoke this certificate';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// Get certificate details by hash (optional endpoint)
app.get('/api/certificate/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const bytes32Hash = hexToBytes32(hash);

    const result = await contract.verifyCertificate(bytes32Hash);
    
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];

    if (isValid) {
      const issuedDate = new Date(Number(issuedAt) * 1000);

      res.json({
        success: true,
        data: {
          isValid: true,
          certificateHash: hash,
          issuer: issuer,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(issuedAt)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Certificate not found or has been revoked'
      });
    }

  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate details',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});