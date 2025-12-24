// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
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
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI matching your Solidity contract
const CONTRACT_ABI = [
  "function issueCertificate(bytes32 certHash) public",
  "function verifyCertificate(bytes32 certHash) public view returns (bool, address, uint256)",
  "event CertificateIssued(bytes32 certHash, address issuer)",
  "event CertificateRevoked(bytes32 certHash)"
];

// Initialize provider and contract
let provider, wallet, contract;

try {
  provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
} catch (error) {
  console.error('Blockchain initialization error:', error.message);
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    endpoints: {
      issue: 'POST /api/issue-certificate',
      verify: 'POST /api/verify-certificate'
    }
  });
});

// ---------------------
// Issue Certificate Endpoint
// ---------------------
app.post('/api/issue-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No PDF uploaded' });

    // Generate Keccak256 hash from PDF buffer
    const bytes32Hash = ethers.utils.keccak256(req.file.buffer);

    console.log('Issue hash:', bytes32Hash);

    const tx = await contract.issueCertificate(bytes32Hash);
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateHash: bytes32Hash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate',
      error: error.message
    });
  }
});

// ---------------------
// Verify Certificate Endpoint
// ---------------------
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No PDF uploaded' });

    // Generate Keccak256 hash from PDF buffer
    const bytes32Hash = ethers.utils.keccak256(req.file.buffer);

    console.log('Verify hash:', bytes32Hash);

    const [isValid, issuer, issuedAt] = await contract.verifyCertificate(bytes32Hash);

    if (isValid) {
      res.json({
        success: true,
        message: 'Certificate is valid',
        data: {
          isValid,
          certificateHash: bytes32Hash,
          issuer,
          issuedAt: Number(issuedAt),
          issuedDate: new Date(Number(issuedAt) * 1000).toISOString()
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Certificate not found or invalid',
        data: {
          isValid: false,
          certificateHash: bytes32Hash
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

// ---------------------
// Error handling middleware
// ---------------------
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
