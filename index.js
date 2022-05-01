const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//Middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klxnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const carCollection = client.db('automoto').collection('car');
        app.get('/car', async (req, res) => {
            const query = {};
            const cursor = carCollection.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        });
        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const carQuery = { _id: ObjectId(id) };
            console.log(carQuery);
            const car = await carCollection.findOne(carQuery);
            res.send(car);
        })
        app.put('/car/:id', async (req, res) => {
            const id = req.params.id;
            const updateCar = req.body;

            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateCar.quantity,
                }
            };
            const result = await carCollection.updateOne(query, updateDoc, options);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Server');
});

app.listen(port, () => {
    console.log('Listening', port);
});