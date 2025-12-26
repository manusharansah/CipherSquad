// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
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
const PROVIDER_URL = process.env.PROVIDER_URL || 'http://127.0.0.1:7545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Contract ABI matching your Solidity contract
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

// Initialize blockchain connection
async function initializeBlockchain() {
  try {
    if (!PROVIDER_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables: PROVIDER_URL, PRIVATE_KEY, or CONTRACT_ADDRESS');
    }

    provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    // Test connection
    await provider.getBlockNumber();
    
    console.log('✅ Blockchain initialized successfully');
    console.log('📍 Provider URL:', PROVIDER_URL);
    console.log('💼 Wallet address:', wallet.address);
    console.log('📜 Contract address:', CONTRACT_ADDRESS);
    
    return true;
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
    return false;
  }
}

// Utility function to generate hash from PDF buffer
function generatePDFHash(pdfBuffer) {
  // Generate SHA-256 hash from PDF buffer
  const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  console.log('🔐 Generated PDF hash:', hash);
  return hash;
}

// Convert hex hash to bytes32 format for smart contract
function hexToBytes32(hexString) {
  // Remove '0x' prefix if present
  const cleanHex = hexString.replace(/^0x/, '');
  
  // Ensure it's exactly 64 characters (32 bytes)
  if (cleanHex.length !== 64) {
    throw new Error(`Invalid hex string length: ${cleanHex.length}. Expected 64 characters.`);
  }
  
  // Add '0x' prefix for Ethereum
  const bytes32 = '0x' + cleanHex;
  console.log('🔢 Converted to bytes32:', bytes32);
  return bytes32;
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    blockchain: {
      connected: contract !== undefined,
      walletAddress: wallet?.address,
      contractAddress: CONTRACT_ADDRESS
    },
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
    // Validate blockchain connection
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized. Please check server configuration.'
      });
    }

    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n📤 Issuing certificate...');
    console.log('📄 File name:', req.file.originalname);
    console.log('📊 File size:', req.file.size, 'bytes');

    // Generate hash from PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    // Check if certificate already exists
    console.log('🔍 Checking if certificate already exists...');
    const existingCert = await contract.verifyCertificate(bytes32Hash);
    
    if (existingCert[0]) { // isValid is true
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued on the blockchain',
        data: {
          certificateHash: pdfHash,
          issuer: existingCert[1],
          issuedAt: new Date(Number(existingCert[2]) * 1000).toISOString()
        }
      });
    }

    console.log('💳 Sending transaction to blockchain...');
    
    // Send transaction to blockchain
    const tx = await contract.issueCertificate(bytes32Hash);
    console.log('📝 Transaction hash:', tx.hash);

    // Wait for transaction confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateHash: pdfHash,
        bytes32Hash: bytes32Hash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        issuer: wallet.address,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('❌ Error issuing certificate:', error);
    
    // Handle specific contract errors
    let errorMessage = 'Failed to issue certificate';
    let statusCode = 500;
    
    if (error.message.includes('Certificate already issued')) {
      errorMessage = 'This certificate has already been issued on the blockchain';
      statusCode = 400;
    } else if (error.message.includes('Invalid certificate hash')) {
      errorMessage = 'Invalid certificate hash';
      statusCode = 400;
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for transaction';
      statusCode = 402;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify Certificate Endpoint
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    // Validate blockchain connection
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized. Please check server configuration.'
      });
    }

    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n🔍 Verifying certificate...');
    console.log('📄 File name:', req.file.originalname);
    console.log('📊 File size:', req.file.size, 'bytes');

    // Generate hash from uploaded PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('🔎 Querying blockchain...');
    
    // Query blockchain for certificate
    const result = await contract.verifyCertificate(bytes32Hash);
    
    // Destructure the result tuple
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];

    console.log('📋 Verification result:', {
      isValid,
      issuer,
      issuedAt: Number(issuedAt)
    });

    if (isValid) {
      const issuedDate = new Date(Number(issuedAt) * 1000);

      console.log('✅ Certificate is VALID');

      res.json({
        success: true,
        message: 'Certificate is valid and verified on blockchain',
        data: {
          isValid: true,
          certificateHash: pdfHash,
          bytes32Hash: bytes32Hash,
          issuer: issuer,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(issuedAt),
          blockchainVerified: true
        }
      });
    } else {
      console.log('❌ Certificate NOT FOUND or REVOKED');

      res.json({
        success: true,
        message: 'Certificate not found on blockchain or has been revoked',
        data: {
          isValid: false,
          certificateHash: pdfHash,
          bytes32Hash: bytes32Hash,
          blockchainVerified: false
        }
      });
    }

  } catch (error) {
    console.error('❌ Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Revoke Certificate Endpoint
app.post('/api/revoke-certificate', upload.single('certificate'), async (req, res) => {
  try {
    // Validate blockchain connection
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized. Please check server configuration.'
      });
    }

    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n🚫 Revoking certificate...');
    console.log('📄 File name:', req.file.originalname);

    // Generate hash from PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    // Verify certificate exists before revoking
    const existingCert = await contract.verifyCertificate(bytes32Hash);
    
    if (!existingCert[0]) {
      return res.status(404).json({
        success: false,
        message: 'Certificate does not exist on blockchain'
      });
    }

    console.log('💳 Sending revocation transaction...');
    
    // Send transaction to blockchain
    const tx = await contract.revokeCertificate(bytes32Hash);
    console.log('📝 Transaction hash:', tx.hash);

    // Wait for transaction confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Certificate revoked in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        certificateHash: pdfHash,
        bytes32Hash: bytes32Hash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('❌ Error revoking certificate:', error);
    
    // Handle specific contract errors
    let errorMessage = 'Failed to revoke certificate';
    let statusCode = 500;
    
    if (error.message.includes('Certificate does not exist')) {
      errorMessage = 'Certificate does not exist on blockchain';
      statusCode = 404;
    } else if (error.message.includes('Not authorized')) {
      errorMessage = 'You are not authorized to revoke this certificate';
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get certificate details by hash
app.get('/api/certificate/:hash', async (req, res) => {
  try {
    // Validate blockchain connection
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    const { hash } = req.params;
    
    // Validate hash format
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hash format. Expected 64 hex characters.'
      });
    }

    const bytes32Hash = hexToBytes32(hash);
    console.log('\n🔍 Fetching certificate by hash:', bytes32Hash);

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
          certificateHash: hash.replace(/^0x/, ''),
          bytes32Hash: bytes32Hash,
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
    console.error('❌ Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🔥 Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  // Initialize blockchain connection first
  const initialized = await initializeBlockchain();
  
  if (!initialized) {
    console.warn('⚠️  Server starting without blockchain connection. Check your configuration.');
  }
  
  app.listen(PORT, () => {
    console.log('\n🚀 Server running successfully!');
    console.log('📍 API URL:', `http://localhost:${PORT}`);
    console.log('📚 Documentation:', `http://localhost:${PORT}`);
    console.log('\n💡 Make sure your .env file contains:');
    console.log('   - PROVIDER_URL (e.g., http://127.0.0.1:7545)');
    console.log('   - PRIVATE_KEY (your wallet private key)');
    console.log('   - CONTRACT_ADDRESS (deployed contract address)');
    console.log('\n');
  });
}

startServer();