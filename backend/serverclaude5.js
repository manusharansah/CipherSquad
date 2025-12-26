const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

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
  limits: { fileSize: 5 * 1024 * 1024 }
});

const PROVIDER_URL = process.env.PROVIDER_URL || 'http://127.0.0.1:7545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_JWT = process.env.PINATA_JWT;

const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "certHash", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "issuer", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string"}
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "certHash", "type": "bytes32"}
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "certHash", "type": "bytes32"},
      {"internalType": "string", "name": "ipfsCID", "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "certHash", "type": "bytes32"}
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "certHash", "type": "bytes32"}
    ],
    "name": "verifyCertificate",
    "outputs": [
      {"internalType": "bool", "name": "isValid", "type": "bool"},
      {"internalType": "address", "name": "issuer", "type": "address"},
      {"internalType": "uint256", "name": "issuedAt", "type": "uint256"},
      {"internalType": "string", "name": "ipfsCID", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider, wallet, contract;

async function initializeBlockchain() {
  try {
    if (!PROVIDER_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables');
    }

    provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    await provider.getBlockNumber();
    
    console.log('✅ Blockchain initialized');
    console.log('📍 Provider:', PROVIDER_URL);
    console.log('💼 Wallet:', wallet.address);
    console.log('📜 Contract:', CONTRACT_ADDRESS);
    
    return true;
  } catch (error) {
    console.error('❌ Blockchain error:', error.message);
    return false;
  }
}

function generatePDFHash(pdfBuffer) {
  const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  console.log('🔐 Hash:', hash);
  return hash;
}

function hexToBytes32(hexString) {
  const cleanHex = hexString.replace(/^0x/, '');
  if (cleanHex.length !== 64) {
    throw new Error(`Invalid hex length: ${cleanHex.length}`);
  }
  return '0x' + cleanHex;
}

async function uploadToPinata(fileBuffer, fileName) {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
      throw new Error('Missing Pinata credentials');
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });

    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'certificate',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', options);

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_API_SECRET;
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      { maxBodyLength: Infinity, headers }
    );

    console.log('✅ IPFS:', response.data.IpfsHash);
    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp
    };
  } catch (error) {
    console.error('❌ Pinata error:', error.response?.data || error.message);
    throw new Error('IPFS upload failed: ' + (error.response?.data?.error || error.message));
  }
}

async function generateQRCode(certificateHash) {
  try {
    const qrData = JSON.stringify({
      type: 'certificate',
      hash: certificateHash,
      version: '1.0'
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 2,
      width: 400,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    
    console.log('📱 QR generated');
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ QR error:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.json({
    status: 'API running',
    blockchain: {
      connected: contract !== undefined,
      wallet: wallet?.address,
      contract: CONTRACT_ADDRESS
    },
    ipfs: {
      configured: !!(PINATA_JWT || (PINATA_API_KEY && PINATA_API_SECRET))
    },
    endpoints: {
      issue: 'POST /api/issue-certificate',
      verify: 'POST /api/verify-certificate',
      verifyQR: 'POST /api/verify-qr',
      revoke: 'POST /api/revoke-certificate',
      revokeQR: 'POST /api/revoke-qr',
      getByHash: 'GET /api/certificate/:hash'
    }
  });
});

app.post('/api/issue-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n📤 Issuing certificate...');
    console.log('📄 File:', req.file.originalname);
    console.log('📊 Size:', req.file.size, 'bytes');

    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('🔍 Checking existence...');
    const existingCert = await contract.verifyCertificate(bytes32Hash);
    
    if (existingCert[0]) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued',
        data: {
          certificateHash: pdfHash,
          issuer: existingCert[1],
          issuedAt: new Date(Number(existingCert[2]) * 1000).toISOString(),
          ipfsCID: existingCert[3],
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${existingCert[3]}`
        }
      });
    }

    console.log('☁️  Uploading to IPFS...');
    const ipfsResult = await uploadToPinata(req.file.buffer, req.file.originalname);
    console.log('📌 CID:', ipfsResult.ipfsHash);

    console.log('💳 Blockchain transaction...');
    const tx = await contract.issueCertificate(bytes32Hash, ipfsResult.ipfsHash);
    console.log('📝 TX:', tx.hash);

    console.log('⏳ Confirming...');
    const receipt = await tx.wait();
    console.log('✅ Block:', receipt.blockNumber);

    console.log('📱 Generating QR...');
    const qrCode = await generateQRCode(pdfHash);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateHash: pdfHash,
        bytes32Hash: bytes32Hash,
        ipfsCID: ipfsResult.ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsResult.ipfsHash}`,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${ipfsResult.ipfsHash}`,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        issuer: wallet.address,
        gasUsed: receipt.gasUsed.toString(),
        qrCode: qrCode
      }
    });
  } catch (error) {
    console.error('❌ Issue error:', error);
    
    let errorMessage = 'Failed to issue certificate';
    let statusCode = 500;
    
    if (error.message.includes('already issued')) {
      errorMessage = 'Certificate already issued';
      statusCode = 400;
    } else if (error.message.includes('Invalid certificate hash')) {
      errorMessage = 'Invalid certificate hash';
      statusCode = 400;
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds';
      statusCode = 402;
    } else if (error.message.includes('IPFS')) {
      errorMessage = error.message;
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n🔍 Verifying certificate...');
    console.log('📄 File:', req.file.originalname);

    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    console.log('🔎 Querying blockchain...');
    const result = await contract.verifyCertificate(bytes32Hash);
    
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];
    const ipfsCID = result[3];

    console.log('📋 Result:', { isValid, issuer, issuedAt: Number(issuedAt), ipfsCID });

    if (isValid) {
      const issuedDate = new Date(Number(issuedAt) * 1000);
      console.log('✅ VALID');

      res.json({
        success: true,
        message: 'Certificate is valid',
        data: {
          isValid: true,
          certificateHash: pdfHash,
          bytes32Hash: bytes32Hash,
          issuer: issuer,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(issuedAt),
          ipfsCID: ipfsCID,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
          ipfsGatewayUrl: `https://ipfs.io/ipfs/${ipfsCID}`,
          blockchainVerified: true
        }
      });
    } else {
      console.log('❌ INVALID/REVOKED');

      res.json({
        success: true,
        message: 'Certificate not found or revoked',
        data: {
          isValid: false,
          certificateHash: pdfHash,
          bytes32Hash: bytes32Hash,
          blockchainVerified: false
        }
      });
    }
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/verify-qr', async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    const { qrData } = req.body;
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'No QR data provided'
      });
    }

    console.log('\n🔍 Verifying via QR...');

    let certificateHash;
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type !== 'certificate' || !parsed.hash) {
        throw new Error('Invalid QR format');
      }
      certificateHash = parsed.hash;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    console.log('📱 Hash from QR:', certificateHash);
    const bytes32Hash = hexToBytes32(certificateHash);

    console.log('🔎 Querying blockchain...');
    const result = await contract.verifyCertificate(bytes32Hash);
    
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];
    const ipfsCID = result[3];

    if (isValid) {
      const issuedDate = new Date(Number(issuedAt) * 1000);
      console.log('✅ VALID');

      res.json({
        success: true,
        message: 'Certificate is valid',
        data: {
          isValid: true,
          certificateHash: certificateHash,
          bytes32Hash: bytes32Hash,
          issuer: issuer,
          issuedDate: issuedDate.toISOString(),
          timestamp: Number(issuedAt),
          ipfsCID: ipfsCID,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
          ipfsGatewayUrl: `https://ipfs.io/ipfs/${ipfsCID}`,
          blockchainVerified: true,
          verificationMethod: 'QR Code'
        }
      });
    } else {
      console.log('❌ INVALID/REVOKED');

      res.json({
        success: true,
        message: 'Certificate not found or revoked',
        data: {
          isValid: false,
          certificateHash: certificateHash,
          bytes32Hash: bytes32Hash,
          blockchainVerified: false,
          verificationMethod: 'QR Code'
        }
      });
    }
  } catch (error) {
    console.error('❌ QR verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/revoke-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('\n🚫 Revoking certificate...');
    console.log('📄 File:', req.file.originalname);

    const pdfHash = generatePDFHash(req.file.buffer);
    const bytes32Hash = hexToBytes32(pdfHash);

    const existingCert = await contract.verifyCertificate(bytes32Hash);
    if (!existingCert[0]) {
      return res.status(404).json({
        success: false,
        message: 'Certificate does not exist'
      });
    }

    console.log('💳 Revoking...');
    const tx = await contract.revokeCertificate(bytes32Hash);
    console.log('📝 TX:', tx.hash);

    console.log('⏳ Confirming...');
    const receipt = await tx.wait();
    console.log('✅ Revoked in block:', receipt.blockNumber);

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
    console.error('❌ Revoke error:', error);
    
    let errorMessage = 'Failed to revoke certificate';
    let statusCode = 500;
    
    if (error.message.includes('does not exist')) {
      errorMessage = 'Certificate does not exist';
      statusCode = 404;
    } else if (error.message.includes('Not authorized')) {
      errorMessage = 'Not authorized to revoke';
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/revoke-qr', async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    const { qrData } = req.body;
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'No QR data provided'
      });
    }

    console.log('\n🚫 Revoking via QR...');

    let certificateHash;
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type !== 'certificate' || !parsed.hash) {
        throw new Error('Invalid QR format');
      }
      certificateHash = parsed.hash;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    console.log('📱 Hash from QR:', certificateHash);
    const bytes32Hash = hexToBytes32(certificateHash);

    const existingCert = await contract.verifyCertificate(bytes32Hash);
    if (!existingCert[0]) {
      return res.status(404).json({
        success: false,
        message: 'Certificate does not exist'
      });
    }

    console.log('💳 Revoking...');
    const tx = await contract.revokeCertificate(bytes32Hash);
    console.log('📝 TX:', tx.hash);

    console.log('⏳ Confirming...');
    const receipt = await tx.wait();
    console.log('✅ Revoked in block:', receipt.blockNumber);

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        certificateHash: certificateHash,
        bytes32Hash: bytes32Hash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        revocationMethod: 'QR Code'
      }
    });
  } catch (error) {
    console.error('❌ QR revoke error:', error);
    
    let errorMessage = 'Failed to revoke certificate';
    let statusCode = 500;
    
    if (error.message.includes('does not exist')) {
      errorMessage = 'Certificate does not exist';
      statusCode = 404;
    } else if (error.message.includes('Not authorized')) {
      errorMessage = 'Not authorized to revoke';
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/certificate/:hash', async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain not initialized'
      });
    }

    const { hash } = req.params;
    if (!/^(0x)?[0-9a-fA-F]{64}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hash format'
      });
    }

    const bytes32Hash = hexToBytes32(hash);
    console.log('\n🔍 Fetching by hash:', bytes32Hash);

    const result = await contract.verifyCertificate(bytes32Hash);
    
    const isValid = result[0];
    const issuer = result[1];
    const issuedAt = result[2];
    const ipfsCID = result[3];

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
          timestamp: Number(issuedAt),
          ipfsCID: ipfsCID,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
          ipfsGatewayUrl: `https://ipfs.io/ipfs/${ipfsCID}`
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Certificate not found or revoked'
      });
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

async function startServer() {
  const initialized = await initializeBlockchain();
  
  if (!initialized) {
    console.warn('⚠️  Server starting without blockchain');
  }
  
  const pinataConfigured = !!(PINATA_JWT || (PINATA_API_KEY && PINATA_API_SECRET));
  if (!pinataConfigured) {
    console.warn('⚠️  Pinata not configured');
  } else {
    console.log('✅ Pinata configured');
  }
  
  app.listen(PORT, () => {
    console.log('\n🚀 Server running!');
    console.log('📍 URL:', `http://localhost:${PORT}`);
    console.log('\n💡 Required .env:');
    console.log('   ✓ PROVIDER_URL');
    console.log('   ✓ PRIVATE_KEY');
    console.log('   ✓ CONTRACT_ADDRESS');
    console.log('   ✓ PINATA_JWT or (PINATA_API_KEY + PINATA_API_SECRET)');
    console.log('\n');
  });
}

startServer();