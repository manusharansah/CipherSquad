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

// Multer configuration for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Blockchain configuration
let provider, wallet, contract;

try {
  if (!process.env.PROVIDER_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
    throw new Error('Missing required environment variables: PROVIDER_URL, PRIVATE_KEY, or CONTRACT_ADDRESS');
  }

  provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const CONTRACT_ABI = [
    "function issueCertificate(bytes32 certHash)",
    "function revokeCertificate(bytes32 certHash)",
    "function verifyCertificate(bytes32 certHash) view returns (bool valid, address issuer, uint256 issuedAt)"
  ];
  
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    CONTRACT_ABI,
    wallet
  );
  
  console.log('✅ Blockchain configuration initialized');
  console.log(`📝 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`👛 Wallet Address: ${wallet.address}`);
} catch (error) {
  console.error('❌ Failed to initialize blockchain configuration:', error.message);
  process.exit(1);
}

// Utility: Generate SHA-256 hash from PDF buffer
function generatePDFHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Optional: API Key authentication middleware
const authenticateAPI = (req, res, next) => {
  // Skip authentication if API_KEY is not set
  if (!process.env.API_KEY) {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid or missing API key' 
    });
  }
  next();
};

// ================= HEALTH CHECK =================
app.get('/api/health', async (req, res) => {
  try {
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(wallet.address);
    
    res.json({
      success: true,
      status: 'healthy',
      server: {
        port: PORT,
        timestamp: new Date().toISOString()
      },
      blockchain: {
        network: network.name,
        chainId: network.chainId.toString(),
        walletAddress: wallet.address,
        balance: ethers.formatEther(balance) + ' ETH',
        contractAddress: process.env.CONTRACT_ADDRESS
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ================= ISSUE CERTIFICATE =================
app.post('/api/issue-certificate', 
  authenticateAPI,
  upload.single('certificate'), 
  async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'PDF file is required' 
        });
      }

      // Generate certificate hash
      const hashHex = generatePDFHash(req.file.buffer);
      const certHash = '0x' + hashHex;

      console.log(`📄 Attempting to issue certificate with hash: ${hashHex}`);

      // Check if certificate already exists (read operation - no gas cost)
      const [valid, issuer, issuedAt] = await contract.verifyCertificate(certHash);
      
      if (valid || issuedAt > 0) {
        console.log(`⚠️  Certificate already exists: ${hashHex}`);
        return res.status(409).json({ 
          success: false, 
          message: 'Certificate already exists on blockchain',
          certificateHash: hashHex,
          existingCertificate: {
            issuer: issuer,
            issuedAt: issuedAt > 0 ? new Date(Number(issuedAt) * 1000).toISOString() : null,
            valid: valid
          }
        });
      }

      // Estimate gas before sending transaction
      let gasEstimate;
      try {
        gasEstimate = await contract.issueCertificate.estimateGas(certHash);
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        return res.status(500).json({
          success: false,
          message: 'Failed to estimate gas for transaction',
          error: gasError.message
        });
      }

      // Issue certificate on blockchain
      const tx = await contract.issueCertificate(certHash, {
        gasLimit: gasEstimate * 120n / 100n // 20% buffer
      });
      
      console.log(`📤 Transaction sent: ${tx.hash}`);
      console.log(`⏳ Waiting for confirmation...`);

      const receipt = await tx.wait();
      
      console.log(`✅ Certificate issued successfully in block ${receipt.blockNumber}`);

      res.json({
        success: true,
        message: 'Certificate issued successfully',
        certificateHash: hashHex,
        transaction: {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: ethers.formatUnits(receipt.gasPrice || 0n, 'gwei') + ' gwei'
        },
        certificate: {
          issuer: wallet.address,
          issuedAt: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error('❌ Error issuing certificate:', err);
      
      // Handle specific error types
      if (err.code === 'INSUFFICIENT_FUNDS') {
        return res.status(500).json({ 
          success: false, 
          message: 'Insufficient funds in wallet to pay for gas',
          error: err.message
        });
      }
      
      if (err.code === 'CALL_EXCEPTION') {
        return res.status(400).json({ 
          success: false, 
          message: 'Transaction reverted by smart contract',
          reason: err.reason || 'Unknown reason',
          error: err.message
        });
      }

      if (err.code === 'NETWORK_ERROR') {
        return res.status(503).json({ 
          success: false, 
          message: 'Blockchain network error',
          error: err.message
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to issue certificate',
        error: err.message 
      });
    }
  }
);

// ================= VERIFY CERTIFICATE =================
app.post('/api/verify-certificate', 
  upload.single('certificate'), 
  async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'PDF file is required' 
        });
      }

      // Generate certificate hash
      const hashHex = generatePDFHash(req.file.buffer);
      const certHash = '0x' + hashHex;

      console.log(`🔍 Verifying certificate with hash: ${hashHex}`);

      // Verify certificate on blockchain
      const [valid, issuer, issuedAt] = await contract.verifyCertificate(certHash);

      const issuedDate = issuedAt > 0 
        ? new Date(Number(issuedAt) * 1000).toISOString() 
        : null;

      if (valid) {
        console.log(`✅ Certificate is VALID`);
      } else if (issuedAt > 0) {
        console.log(`⚠️  Certificate found but REVOKED`);
      } else {
        console.log(`❌ Certificate NOT FOUND on blockchain`);
      }

      res.json({
        success: true,
        certificateHash: hashHex,
        verification: {
          valid: valid,
          status: valid ? 'VALID' : (issuedAt > 0 ? 'REVOKED' : 'NOT_FOUND'),
          issuer: issuer !== ethers.ZeroAddress ? issuer : null,
          issuedAt: issuedDate
        }
      });

    } catch (err) {
      console.error('❌ Error verifying certificate:', err);
      
      if (err.code === 'NETWORK_ERROR') {
        return res.status(503).json({ 
          success: false, 
          message: 'Blockchain network error',
          error: err.message
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify certificate',
        error: err.message 
      });
    }
  }
);

// ================= REVOKE CERTIFICATE =================
app.post('/api/revoke-certificate',
  authenticateAPI,
  upload.single('certificate'),
  async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'PDF file is required' 
        });
      }

      // Generate certificate hash
      const hashHex = generatePDFHash(req.file.buffer);
      const certHash = '0x' + hashHex;

      console.log(`🚫 Attempting to revoke certificate with hash: ${hashHex}`);

      // Check if certificate exists and is valid
      const [valid, issuer, issuedAt] = await contract.verifyCertificate(certHash);
      
      if (!valid && issuedAt === 0n) {
        return res.status(404).json({ 
          success: false, 
          message: 'Certificate not found on blockchain',
          certificateHash: hashHex
        });
      }

      if (!valid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Certificate is already revoked',
          certificateHash: hashHex
        });
      }

      // Estimate gas
      const gasEstimate = await contract.revokeCertificate.estimateGas(certHash);
      
      // Revoke certificate
      const tx = await contract.revokeCertificate(certHash, {
        gasLimit: gasEstimate * 120n / 100n
      });
      
      console.log(`📤 Revoke transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      console.log(`✅ Certificate revoked successfully in block ${receipt.blockNumber}`);

      res.json({
        success: true,
        message: 'Certificate revoked successfully',
        certificateHash: hashHex,
        transaction: {
          hash: tx.hash,
          blockNumber: receipt.blockNumber
        }
      });

    } catch (err) {
      console.error('❌ Error revoking certificate:', err);
      
      if (err.code === 'INSUFFICIENT_FUNDS') {
        return res.status(500).json({ 
          success: false, 
          message: 'Insufficient funds in wallet to pay for gas'
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to revoke certificate',
        error: err.message 
      });
    }
  }
);

// ================= GET CERTIFICATE BY HASH =================
app.get('/api/certificate/:hash', async (req, res) => {
  try {
    const hashHex = req.params.hash.replace('0x', '');
    
    // Validate hash format
    if (!/^[a-fA-F0-9]{64}$/.test(hashHex)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate hash format. Must be 64 hex characters.'
      });
    }

    const certHash = '0x' + hashHex;
    
    const [valid, issuer, issuedAt] = await contract.verifyCertificate(certHash);

    if (issuedAt === 0n) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        certificateHash: hashHex
      });
    }

    res.json({
      success: true,
      certificate: {
        hash: hashHex,
        valid: valid,
        status: valid ? 'VALID' : 'REVOKED',
        issuer: issuer,
        issuedAt: new Date(Number(issuedAt) * 1000).toISOString()
      }
    });

  } catch (err) {
    console.error('Error fetching certificate:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: err.message
    });
  }
});

// ================= ERROR HANDLING =================
// Handle multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ================= START SERVER =================
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log(`🚀 Certificate Registry Server`);
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(wallet.address);
    console.log(`⛓️  Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`👛 Wallet: ${wallet.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`📝 Contract: ${process.env.CONTRACT_ADDRESS}`);
  } catch (error) {
    console.error('⚠️  Warning: Could not fetch network info:', error.message);
  }
  
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/issue-certificate');
  console.log('  POST /api/verify-certificate');
  console.log('  POST /api/revoke-certificate');
  console.log('  GET  /api/certificate/:hash');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});