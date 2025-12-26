// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs allowed'), false);
  }
});

// Blockchain config
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const CONTRACT_ABI = [
  "function issueCertificate(bytes32 certHash)",
  "function revokeCertificate(bytes32 certHash)",
  "function verifyCertificate(bytes32 certHash) view returns (bool valid, address issuer, uint256 issuedAt)"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);

// Utility: SHA-256 hash
function generatePDFHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ================= ISSUE CERTIFICATE =================
app.post('/api/issue-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF required' });
    }

    const hashHex = generatePDFHash(req.file.buffer);
    const certHash = '0x' + hashHex;

    const tx = await contract.issueCertificate(certHash);
    await tx.wait();

    res.json({
      success: true,
      message: 'Certificate issued',
      certificateHash: hashHex,
      transactionHash: tx.hash
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= VERIFY CERTIFICATE =================
app.post('/api/verify-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF required' });
    }

    const hashHex = generatePDFHash(req.file.buffer);
    const certHash = '0x' + hashHex;

    const [valid, issuer, issuedAt] =
      await contract.verifyCertificate(certHash);

    res.json({
      success: true,
      certificateHash: hashHex,
      valid,
      issuer,
      issuedAt: issuedAt > 0
        ? new Date(Number(issuedAt) * 1000).toISOString()
        : null
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
