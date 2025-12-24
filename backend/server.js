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
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Your wallet private key
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Deployed contract address

// Smart Contract ABI (simplified - replace with your actual ABI)
const CONTRACT_ABI = [
  "function issueCertificate(bytes32 certificateHash, string memory certificateId, string memory studentName) public returns (bool)",
  "function verifyCertificate(bytes32 certificateHash) public view returns (bool, uint256, string memory, string memory)",
  "event CertificateIssued(bytes32 indexed certificateHash, string certificateId, string studentName, uint256 timestamp)"
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

// Utility function to generate hash from PDF buffer
function generatePDFHash(pdfBuffer) {
  return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
}

// Convert hex hash to bytes32 format for smart contract
function hexToBytes32(hexString) {
  return '0x' + hexString;
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    endpoints: {
      issue: 'POST /api/issue-certificate',
      verify: 'POST /api/verify-certificate'
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

    const { certificateId, studentName } = req.body;

    if (!certificateId || !studentName) {
      return res.status(400).json({
        success: false,
        message: 'certificateId and studentName are required'
      });
    }

    // Generate hash from PDF
    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('Issuing certificate...');
    console.log('Certificate ID:', certificateId);
    console.log('Student Name:', studentName);
    console.log('PDF Hash:', pdfHash);

    // Send transaction to blockchain
    const tx = await contract.issueCertificate(
      bytes32Hash,
      certificateId,
      studentName
    );

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log('Transaction confirmed in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateId,
        studentName,
        certificateHash: pdfHash,
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
    const [isValid, timestamp, certificateId, studentName] = await contract.verifyCertificate(bytes32Hash);

    if (isValid) {
      const issuedDate = new Date(Number(timestamp) * 1000);

      res.json({
        success: true,
        message: 'Certificate is valid',
        data: {
          isValid: true,
          certificateHash: pdfHash,
          certificateId,
          studentName,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(timestamp)
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Certificate not found or invalid',
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

// Get certificate details by hash (optional endpoint)
app.get('/api/certificate/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const bytes32Hash = hexToBytes32(hash);

    const [isValid, timestamp, certificateId, studentName] = await contract.verifyCertificate(bytes32Hash);

    if (isValid) {
      const issuedDate = new Date(Number(timestamp) * 1000);

      res.json({
        success: true,
        data: {
          isValid: true,
          certificateHash: hash,
          certificateId,
          studentName,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(timestamp)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Certificate not found'
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