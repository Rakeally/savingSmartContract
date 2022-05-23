const express = require('express')
const { InMemorySigner } = require('@taquito/signer');
const {TezosToolkit, MichelCodecPacker } = require('@taquito/taquito');

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

const contractKey='KT1LeSRAyB3RfXST6DgnwkKHPuw3RmHHU6Dj';


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
  servers: [
    {
      url: 'http://localhost:8000',
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


  //*********************************Get Balance**************************************8 */

  /**
 * @swagger
 * /Balance:
 *   get:
 *     summary: Tezos account balance
 *     description: Retrieve tezos account balance
 *     responses:
 *       200:
 *         description: Tezos Balance.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
*/
app.get('/Balance', (req,res) => {
  tezos.tz
  .getBalance(privateKey)
  .then((balance) =>{
    console.log(`Public key balance is: ${balance.toNumber() / 1000000} ꜩ`);
    return res.send((balance.toNumber() / 1000000).toString());
  })
  .catch((error) => {
    // console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    console.log(`Error: verify your infos`);
    return res.status(400);
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
 *                  example: 1
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
 *                  example: 2022-05-23 
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
          return res.status(400);
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
 *                  example: 1
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
          return res.status(400);
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
 *                  example: 1
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
          return res.status(400);
          })      .finally(()=>{
      res.end();
    })
  
  })


//Transfer Tez to participants after withdraw demand

 /**
 * @swagger
 * /transfer:
 *   post:
 *     summary: Tranfer Tez to Account owner after withdraw demand
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                  type: integer
 *                  description: Amount to be transferred
 *                  example: 24
 *               address:
 *                  type: string
 *                  description: Participant's publickey 
 *                  example: tz1M6x9Y4cAGWpmkJjrSopTLfTLAUVmCZhh4
*/ 
app.post('/transfer', (req,res) => {
  const amount = req.body.amount;
  const address = req.body.address;

console.log(`Transfering ${amount} ꜩ to ${address}...`);
tezos.contract
  .transfer({ to: address, amount: amount })
  .then((op) => {
    console.log(`Waiting for ${op.hash} to be confirmed...`);
    // return op.confirmation(1).then(() => op.hash);
    return res.send(op.hash);
  })
  .then((hash) => console.log(`Operation injected: https://ithaca.tzstats.com/${hash}`))
  .catch((error) => console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`+ error));

}
)




var port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("App is running on port " + port);
});
