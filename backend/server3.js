// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Middleware
// ---------------------
app.use(cors());
app.use(express.json());

// ---------------------
// Multer Configuration (PDF Upload)
// ---------------------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ---------------------
// Blockchain Configuration
// ---------------------
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI (must match Solidity contract exactly)
const CONTRACT_ABI = [
  "function issueCertificate(bytes32 certHash) public",
  "function verifyCertificate(bytes32 certHash) public view returns (bool, address, uint256)",
  "event CertificateIssued(bytes32 certHash, address issuer)",
  "event CertificateRevoked(bytes32 certHash)"
];

// Initialize blockchain objects
let provider, wallet, contract;

try {
  provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
} catch (err) {
  console.error("❌ Blockchain init failed:", err.message);
  process.exit(1);
}

// ---------------------
// Health Check
// ---------------------
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
// Issue Certificate
// ---------------------
app.post('/api/issue-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF uploaded' });
    }

    // ✅ ethers v6 compatible hash
    const certHash = ethers.keccak256(req.file.buffer);
    console.log('Issue hash:', certHash);

    // ✅ Prevent duplicate certificates
    const [alreadyIssued] = await contract.verifyCertificate(certHash);
    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued'
      });
    }

    const tx = await contract.issueCertificate(certHash);
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateHash: certHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (error) {
    console.error('Issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate',
      error: error.message
    });
  }
});

// ---------------------
// Verify Certificate
// ---------------------
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF uploaded' });
    }

    // ✅ ethers v6 compatible hash
    const certHash = ethers.keccak256(req.file.buffer);
    console.log('Verify hash:', certHash);

    const [isValid, issuer, issuedAt] =
      await contract.verifyCertificate(certHash);

    if (!isValid) {
      return res.json({
        success: true,
        message: 'Certificate not found or invalid',
        data: {
          isValid: false,
          certificateHash: certHash
        }
      });
    }

    res.json({
      success: true,
      message: 'Certificate is valid',
      data: {
        isValid,
        certificateHash: certHash,
        issuer,
        issuedAt: Number(issuedAt),
        issuedDate: new Date(Number(issuedAt) * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// ---------------------
// Start Server
// ---------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
