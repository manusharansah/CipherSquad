const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= MULTER ================= */
const upload = multer({ storage: multer.memoryStorage() });

/* ================= BLOCKCHAIN ================= */
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  "function issueCertificate(bytes32 certHash)",
  "function verifyCertificate(bytes32 certHash) view returns (bool valid, address issuer, uint256 issuedAt)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

/* ================= UTIL ================= */
function generateCertHash(buffer) {
  // 🔧 FIX: keccak256 → bytes32 (required by Solidity)
  return ethers.keccak256(buffer);
}

/* ================= ISSUE ================= */
app.post("/api/issue-certificate", upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file missing" });
    }

    const certHash = generateCertHash(req.file.buffer);

    const tx = await contract.issueCertificate(certHash);
    const receipt = await tx.wait();

    return res.json({
      success: true,
      data: {
        certificateHash: certHash,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.reason || err.message
    });
  }
});

/* ================= VERIFY ================= */
app.post("/api/verify-certificate", upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file missing" });
    }

    const certHash = generateCertHash(req.file.buffer);

    const result = await contract.verifyCertificate(certHash);

    return res.json({
      success: true,
      data: {
        valid: result[0],
        issuer: result[1],
        issuedAt: Number(result[2]),
        certHash
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.reason || err.message
    });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});