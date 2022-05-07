const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


//db Connection




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m9t3t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {

        await client.connect();
        const productCollection = client.db('wareHouseManagement').collection('product');
        //get data
        app.get('/product', async (req, res) => {
            console.log(req.body)
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);


        });
        //post data add
        app.post('/product', async (req, res) => {
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

        //delete
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);


        })


    }
    finally {
        console.log('error')

    }

}
run().catch(console.dir);


//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('running warehouse server');
});
app.listen(port, () => {
    console.log('listening to port')
})