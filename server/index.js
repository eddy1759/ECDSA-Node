const express = require("express");
const app = express();
const cors = require("cors");
const { balances, privateKeys} = require('./utils/addresses')
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak')


const port = 3042;

app.use(cors());
app.use(express.json());

const PRIVATE_KEY = Object.keys(privateKeys)[1]
const PUBLIC_KEY = Object.values(privateKeys)[1]

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount } = req.body;
  console.log(req.body)

  const message = `${sender}${recipient}${amount}`;
  console.log(message);

  const messageHash = keccak256(Buffer.from(JSON.stringify(message), 'utf8'));
  const msgHsh = toHex(messageHash)
  // console.log('messageHash:', msgHsh);
  

  // sign the recovery key
    
  const signatureArray = await secp.sign(msgHsh, PRIVATE_KEY, {recovered: true});
  const signature = toHex(signatureArray[0]);
  // console.log('signature', signature);
  const recoveryBit = signatureArray[1];
    
  // recover public key
  const signaturePublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
  // console.log(signaturePublicKey);

  const signaturePublicKeyToHex = toHex(signaturePublicKey);
  // console.log(signaturePublicKeyToHex);

  setInitialBalance(sender);
  setInitialBalance(recipient);


  if (signaturePublicKeyToHex !== PUBLIC_KEY) {
    return res.status(400).send({message: "You are not the person!"}) 
    
  } else {  
    if (balances[sender] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
