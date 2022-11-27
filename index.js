const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.um0mdwv.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run(){
    try{
        const usersCollection = client.db('proyojonallUsers').collection('users');
        const b2bProductsCollection = client.db('proyojonB2B').collection('products');
        const b2cProductsCollection = client.db('proyojonB2C').collection('products');

        function verifyJWT(req, res, next){
            const authheader = req.headers.authorization;
            if(!authheader){
                return res.send.status(401).send('unauthorized access');
            }
            const token = authheader.split(' ')[1];

            jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
                if(err){
                    return res.send.status(403).send({message: 'forbidden access'})
                }
                req.decoded = decoded;
                next();
            })
        }

        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn: '3h'
                })
                return res.send({accessToken: token})
            }
            // console.log(user);
            res.status(403).send({accessToken: ''})
            
        })
     

        //set to database all users
        app.post('/users',async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(user);
            res.send(result);
        })

        //get from database
        app.get('/users',async(req,res)=>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        //get users
        app.get('/users/b2b',async(req,res)=>{
            const query = {account:"b2b"};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
            
        })

        app.get('/users/b2cSeller',async(req,res)=>{
            const query = {account:"b2cSeller"};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
            
        })

        app.get('/users/b2cBuyer',async(req,res)=>{
            const query = {account:"b2cBuyer"};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
            
        })

        //set admin to database
        app.put('/users/admin/:id',verifyJWT,async (req,res)=>{
            const decodedEmail = req.decoded.email;
            const query ={email: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message:'forbidden access'})
            }
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const options = {upsert: true};
            const updatedDOc = {
                $set:{
                    role:'admin',
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDOc, options);
            res.send(result);
        });

        
        //authorization
        app.get('/users/admin/:email',async(req,res)=>{
            const email  = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});

        })
        app.get('/users/b2b/:email',async(req,res)=>{
            const email  = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isB2Buser: user?.account === 'b2b'});

        })
        app.get('/users/b2cseller/:email',async(req,res)=>{
            const email  = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isB2Cseller: user?.account === 'b2cSeller'});

        })
        app.get('/users/b2cb/:email',async(req,res)=>{
            const email  = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isB2Cbuyer: user?.account === 'b2cBuyer'});

        })

        //add products
        app.post('/b2bProducts',async(req, res)=>{
            const user = req.body;
            const result = await b2bProductsCollection.insertOne(user);
            console.log(user);
            res.send(result);
        })
        app.post('/b2cProducts',async(req, res)=>{
            const user = req.body;
            const result = await b2cProductsCollection.insertOne(user);
            console.log(user);
            res.send(result);
        })

        //get products
        app.get('/b2bProducts',async(req, res)=>{
            const query = {}
            const products = await b2bProductsCollection.find(query).toArray();
            res.send(products);
        })
        app.get('/b2cProducts',async(req, res)=>{
            const query = {}
            const products = await b2cProductsCollection.find(query).toArray();
            res.send(products);
        })

        app.get('/b2bProducts/shoe',async(req,res)=>{
            const query = {p_category:"shoe"};
            const result = await b2bProductsCollection.find(query).toArray();
            res.send(result);
            
        })
        app.get('/b2bProducts/bag',async(req,res)=>{
            const query = {p_category:"bag"};
            const result = await b2bProductsCollection.find(query).toArray();
            res.send(result);
            
        })
        app.get('/b2bProducts/jacket',async(req,res)=>{
            const query = {p_category:"jacket"};
            const result = await b2bProductsCollection.find(query).toArray();
            res.send(result);
            
        })
        app.get('/b2cProducts/shoe',async(req,res)=>{
            const query = {p_category:"shoe"};
            const result = await b2cProductsCollection.find(query).toArray();
            res.send(result);
            
        })
        app.get('/b2cProducts/bag',async(req,res)=>{
            const query = {p_category:"bag"};
            const result = await b2cProductsCollection.find(query).toArray();
            res.send(result);
            
        })
        app.get('/b2cProducts/jacket',async(req,res)=>{
            const query = {p_category:"jacket"};
            const result = await b2cProductsCollection.find(query).toArray();
            res.send(result);
            
        })

    }
    finally{

    }
}
run().catch(console.log);

app.get('/',async(req,res)=>{
    res.send('proyojon.com server is running')
})

app.listen(port,()=>console.log(`Proyojon.com running on ${port}`))