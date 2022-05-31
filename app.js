const express = require('express')
const { InMemorySigner } = require('@taquito/signer');
const {TezosToolkit, MichelCodecPacker } = require('@taquito/taquito');
const { KeyStoreUtils, SoftSigner } = require('conseiljs-softsigner');
const { TezosNodeWriter, KeyStoreType } = require('conseiljs');

var  swaggerJSDoc = require("swagger-jsdoc");
var  swaggerUi = require("swagger-ui-express");
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const acc = require('./ithacanet.json')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set('views', __dirname);

const tezos = new TezosToolkit('https://ithacanet.smartpy.io');

const contractKey='KT19uY7VYK4a5EeujFMAP1Wrh9npuSYdDaGS';


const privateKey ="tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv";
const https = require("https");
tezos.setPackerProvider(new MichelCodecPacker());
tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))



const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API for Saving Account smart contract',
    version: '1.0.0',
    description:
      'This is a REST API application made with Express. It sends and retrieves data from saving smart contract.',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com',
    },
  },
  // servers: [
  //   {
  //     url: 'https://savingsmartcontract.herokuapp.com',
  //     description: 'Development server',
  //   },
  // ],
  servers: [
    {
      url: 'http://localhost:8100/',
      description: 'Development server',
    },
  ],

};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJSDoc(options);


app.use('/apis', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', (req, res) => {
  res
    .status(200)
    .send('Hello server is running')
    .end();
});


//*********************************Create Tezos account***************************************/


  /**
 * @swagger
 * /createTezWallet:
 *   get:
 *     summary: create Tezos wallet 
 *     description: create Tezos wallet
 *     responses:
 *       '200':
 *         description: Tezos wallet created.
 *       '400':
 *         description: An error occured
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
*/
app.get('/createTezWallet', async(req, res) => {
  try {
    console.log('test');
  const mnemonic = KeyStoreUtils.generateMnemonic();
  console.log(`mnemonic: ${mnemonic}`);

  // console.log('Create signer...'+ keystore.secretKey);
  // const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keystore.secretKey, 'edsk'));
  // console.log('Signer Created...');
  // const result = await TezosNodeWriter.sendIdentityActivationOperation(tezosNode, signer, keystore, '55c5b519-2554-4a7d-a8f5-2c7ba591a8ee');

  // console.log(`Injected operation group id ${result.operationGroupID}`)

  return res.send({ Mnemonic:mnemonic })

  } catch (error) {
    console.log(`Error: verify your infos`);
    return res.status(400).send("Oops error, try again later");
  }finally{
    res.end();
  }     

});



//*********************************Restore Tezos Wallet***************************************/


  /**
 * @swagger
 * /restoreTezWallet:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: error occured, try again
 *        '500':
 *          description: Server error
 *     summary: Restore wallet from Mnemonic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mnemonic:
 *                  type: string
 *                  description: Restore wallet from Mnemonic 
 *                  example: industry indicate noble later second person comfort security fog bachelor volume tribe clap tunnel light hazard harsh foot eyebrow steel elder tent journey shield
*/
app.post('/restoreTezWallet', async(req, res) => {
  try {
    console.log('test');
  const mnemonic = req.body.mnemonic;
  console.log(`mnemonic: ${mnemonic}`);
  const keystore = await KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, '');
  console.log('Keystore: ' +keystore)
  console.log(`account id: ${keystore.publicKeyHash}`);
  console.log(`public key: ${keystore.publicKey}`);
  console.log(`secret key: ${keystore.secretKey}`);

  return res.json({ accountId: keystore.publicKeyHash,
                    publicKey: keystore.publicKey,
                    secretKey: keystore.secretKey,
                    Passphrase:mnemonic
                  })

  } catch (error) {
    console.log(`Error: Incorrect Mnemonic`);
    return res.status(400).send("Incorrect Mnemonic, try again");
  }finally{
    res.end();
  }     

});



  //*********************************Get Balance**************************************8 */

  /**
 * @swagger
 * /walletBalance:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: Incorrect publicKey, try again
 *        '500':
 *          description: Server error
 *     summary: Check wallet balance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicKey:
 *                  type: string
 *                  description: public key
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv
*/
app.post('/walletBalance', (req,res) => {
  publicKey = req.body.publicKey;
  tezos.tz
  .getBalance(publicKey)
  .then((balance) =>{
    console.log(`Public key balance is: ${balance.toNumber() / 1000000} ꜩ`);
    return res.send(`Wallet balance is: ${balance.toNumber() / 1000000} ꜩ`);
  })
  .catch((error) => {
    // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    console.log(`Error: verify your infos`);
    return res.status(400).send("Enter a valid Tezos Public key and try again");

    }) 
  .finally(()=>{
    res.end();
  })

})




    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////                           ALL POST FUNCTIONS FOR THE SMART CONTRACT                          ////   
    //////////////////////////////////////////////////////////////////////////////////////////////////////




//*********************************Create Saving***************************************/

  /**
 * @swagger
 * /savingAccounts:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: An error occured
 *        '500':
 *          description: Server error
 *     summary: Create a saving Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                  type: integer
 *                  description: Account id
 *                  example: 4
 *               publicKey:
 *                  type: string
 *                  description: Saving Account public key 
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv
 *               name:
 *                  type: string
 *                  description: Saving Account name
 *                  example: Laptop purchase saving
 *               withdrawDate:
 *                  type: string
 *                  description: Withdrawal date 
 *                  example: 2022-05-23T11:45:25
*/
app.post('/savingAccounts', (req,res) => {
  tezos.contract
    .at(contractKey)
    .then((contract) => {
      const date = new Date();
      var timestamp = date.getTime();;
      const id =req.body.id;
      const name= req.body.name;
      const publicKey = req.body.publicKey;
      const withdrawDate = new Date(req.body.withdrawDate);
      var timestamp2= withdrawDate.getTime();;


      console.log("Creating a saving account with credentials " +date, timestamp.toString(),id, name, publicKey, withdrawDate, timestamp2.toString());
      return contract.methods.savingAccounts(timestamp.toString(),id, name, publicKey, timestamp2.toString()).send();
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`);
      return res.send((op.hash).toString());
    })
  
.catch((error) => {
          // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
          console.log(`Error: verify your infos`);
          return res.status(400).send("Sorry Id already in use, try again with a different id");
        })      .finally(()=>{
      res.end();
    })
  
  })


//*********************************add Saving***************************************/

/**
 * @swagger
 * /addSaving:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: An error occured
 *        '500':
 *          description: Server error
 *     summary: Add saving to Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                  type: integer
 *                  description: Amount to save
 *                  example: 50
 *               id:
 *                  type: integer
 *                  description: Account id
 *                  example: 4
 *               publicKey:
 *                  type: string
 *                  description: Saving account public key
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv
*/
app.post('/addSaving', (req,res) => {
  tezos.contract
    .at(contractKey)
    .then((contract) => {
      const amount =req.body.amount
      const date = new Date();
      var timestamp = date.getTime();
      const id =req.body.id
      const publicKey = req.body.publicKey


      console.log("Creating a saving account with credentials " + amount, timestamp.toString(),id, publicKey);
      return contract.methods.addSaving(amount, timestamp.toString(),id, publicKey).send();
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`);
      return res.send((op.hash).toString());
    })
  
.catch((error) => {
          // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
          console.log(`Error: verify your infos`);
          return res.status(400).send("Verify your public key or Id infos and try again");
        })      .finally(()=>{
      res.end();
    })
  
  })


  //*********************************demande withdraw***************************************/

  /**
 * @swagger
 * /demandWithdraw:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: An error occured
 *        '500':
 *          description: Server error
 *     summary: Demand withdraw from saving Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                  type: integer
 *                  description: Amount to save
 *                  example: 50
 *               id:
 *                  type: integer
 *                  description: Account id
 *                  example: 4
 *               publicKey:
 *                  type: string
 *                  description: Saving account public key
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv
*/
app.post('/demandWithdraw', (req,res) => {
  tezos.contract
    .at(contractKey)
    .then((contract) => {
      const amount =req.body.amount
      const date = new Date();
      var timestamp = date.getTime();
      const id =req.body.id
      const publicKey = req.body.publicKey


      console.log("Demand withdraw from saving account with credentials " + amount,date, timestamp.toString(),id, publicKey);
      return contract.methods.demandWithdraw(amount, timestamp.toString(),id, publicKey).send();
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`);
      return res.send((op.hash).toString());
    })
  
.catch((error) => {
          // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
          console.log(`Error: verify your infos`);
          return res.status(400).send("Not yet withdrawal time, try again later");
          })      .finally(()=>{
      res.end();
    })
  
  })


//Transfer Tez to participants after withdraw demand
  /**
 * @swagger
 * /transfer:
 *   post:
 *     responses:
 *        '200':
 *          description: success
 *        '400':
 *          description: An error occured
 *        '500':
 *          description: Server error
 *     summary: send Tez to wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                  type: integer
 *                  description: Amount to send
 *                  example: 50
 *               publicKey:
 *                  type: string
 *                  description:  account public key
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZoLv
*/
app.post('/transfer', (req,res) => {
  const amount = req.body.amount;
  const publicKey = req.body.publicKey;

console.log(`Transfering ${amount} ꜩ to ${publicKey}...`);
tezos.contract
  .transfer({ to: publicKey, amount: amount })
  .then((op) => {
    console.log(`Waiting for ${op.hash} to be confirmed...`);
    // return op.confirmation(1).then(() => op.hash);
    return res.send((op.hash).toString());
  })

  .catch((error) => {
    // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    console.log(`Error: verify your infos`);
    return res.status(400).send("Public key not valid, try again later");
    })      .finally(()=>{
res.end();
})

})
var port = process.env.PORT || 8100;

app.listen(port, () => {
  console.log("App is running on port " + port);
});
