const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyepuci.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db("summerCampDb").collection("users");
        const classCollection = client.db("summerCampDb").collection("class");
        const instructorCollection = client.db("summerCampDb").collection("instructor");
        const myClassCollection = client.db("summerCampDb").collection("myClass");

        // users relared apis

        app.post('/users', async(req,res)=>{
            const user= req.body;
            const query = {email: user.email}
            const existingUser = await usersCollection.findOne(query);
            if(existingUser){
                return res.send({message: 'user already exist' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })



        // allClass relared apis
        app.get('/class', async(req,res)=>{
            const result =await classCollection.find().toArray();
            res.send(result);
        })

        // all instructior relard apis
        app.get('/instructor', async(req,res)=>{
            const result =await instructorCollection.find().toArray();
            res.send(result);
        })


        // my class related apis
        app.get('/myclass', async(req,res)=>{
            const email = req.query.email;
            console.log(email);
            if(!email){
                res.send([]);
                return;
            }
            const query = {email: email};
            const result = await myClassCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/myclass', async(req,res)=>{
            const item = req.body;
            const result = await myClassCollection.insertOne(item);
            res.send(result);
        })
        app.delete('/myclass/:id', async(req,res)=>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const result = await myClassCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('summer camp server is running')
})

app.listen(port, () => {
    console.log(`summer camp server is running on port: ${port}`);
})