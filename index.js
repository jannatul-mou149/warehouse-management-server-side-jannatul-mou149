const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//Middleware

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klxnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const carCollection = client.db('automoto').collection('car');
        const supplierCollection = client.db('supplier').collection('supplierInfo');
        app.get('/car', async (req, res) => {
            const query = {};
            const cursor = carCollection.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        });
        app.get('/supplierInfo', async (req, res) => {
            const query = {};
            const cursor = supplierCollection.find(query);
            const supplierInfo = await cursor.toArray();
            res.send(supplierInfo);
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
                    sold: updateCar.sold,
                }
            };
            const result = await carCollection.updateOne(query, updateDoc, options);
        })
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/car', async (req, res) => {
            const newItem = req.body;
            const result = await carCollection.insertOne(newItem);
            res.send(result);
        })
        app.get('/myItems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = carCollection.find(query);
                const cars = await cursor.toArray();
                res.send(cars);
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
        })
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
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