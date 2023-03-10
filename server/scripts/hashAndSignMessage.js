const { keccak256 } = require('ethereum-cryptography/keccak')
const secp = require('ethereum-cryptography/secp256k1')
const { balances, privateKeys} = require('../utils/addresses')


( async () => {
    const PRIVATE_KEY = Object.keys(privateKeys)[0]
    let msg = {
        from: Object.keys(balances)[0],
        to: Object.keys(balances)[2],
        amount: 20
    };

    // console.info("Message:", msg);

    const msgHash = keccak256(Buffer.from(JSON.stringify(msg)))
    // console.info('Hashed Message:', msgHash.toString('hex'))

    // Sign the message using the private key
    const [signature, recoveryBit] = await secp.sign(msgHash, PRIVATE_KEY, {recovered: true})

    console.log('Signature:', signature.toString('hex'));
    console.log('Recovery Bit:', recoveryBit);
})();

