const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { get } = require('express/lib/response');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}



//db Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m9t3t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {

        await client.connect();
        const productCollection = client.db('wareHouseManagement').collection('product');

        //get data
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ accessToken });
            console.log(data);

        });
        //search my items
        app.get('/product/my', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);


        });


        app.put('/product/:id/delivered', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            const updateDoc = {
                $set: {
                    quantity: product.quantity - 1,
                    sold: product.sold + 1
                },
            };
            const result = await productCollection.updateOne(query, updateDoc);
            res.send(result);

        });


        //restock
        app.put('/product/:id/restock', async (req, res) => {
            const id = req.params.id;
            const { quantity } = req.body;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            const updateDoc = {
                $set: {
                    quantity: parseInt(product.quantity) + parseInt(quantity)
                },
            };
            const result = await productCollection.updateOne(query, updateDoc);
            res.send(result);

        });

        //post data add
        app.post('/product', verifyJWT, async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //find one
        app.get('/product/:id', async (req, res) => {
            console.log(req.params.id)
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);

            res.send(product);

        });

        app.put('/product/:id', async (res, req) => {
            const id = req.params.id;
            const updateStock = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updateStock


            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        });

        //delete
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);

        });

    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running warehouse server');
});
app.listen(port, () => {
    console.log('listening to port')
})