// Import dependencies modules:ync
const express = require('express')
// const bodyParser = require('body-parser')

var path = require("path");

// Create an Express.js instance:
const app = express()
// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
})

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;
//MongoClient.connect('mongodb+srv://MyMongoDBUser:wednesday@cluster0.epqbr.mongodb.net', (err, client) => {
//   db = client.db('webstore')
//})
MongoClient.connect('mongodb+srv://budarachamudi:chamu202@cluster0.jitrk.mongodb.net/', (err, client) => {
    db = client.db('Webstore')
})


var staticPath = path.resolve(__dirname,"assets");
app.use('/assets',express.static(staticPath));
    //put error that file not found
    app.use('/assets', (req, res) => {
        res.status(404).send('File Not Found');
    });

// dispaly a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    // console.log('collection name:', req.collection)
    return next()
})


// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})



//adding post
// app.post('/collection/:collectionName', (req, res, next) => {
//     req.collection.insert(req.body, (e, results) => {
//     if (e) return next(e)
//     res.send(results.ops)
//     })
//     })
//this is the old code
app.put('/collection/Products/:id', (req, res) => {
    const lessonId = new ObjectID(req.params.id);
    const { availableInventory } = req.body;
  
    req.collection.updateOne(
      { _id: lessonId },
      { $set: { availableInventory } },
      (err, result) => {
        if (err) return res.status(500).send({ msg: "Error updating inventory" });
        res.status(200).send({ msg: "Inventory updated successfully" });
      }
    );
  });
app.post('/collection/Orders', async (req, res) => {
    const newOrder = req.body;
    try {
        // Your logic to process the order, like saving it in the database
        const result = await db.collection('Orders').insertOne(newOrder);
        
        if (result.insertedCount === 0) {
            throw new Error("Failed to save the order to the database.");
        }

        res.status(200).json({ success: true, message: "Order placed successfully." });
    } catch (error) {
        console.error("Error processing the order:", error);
        res.status(500).json({ success: false, error: "An error occurred while processing the order." });
    }
});






    
    // return with object id 
    
    const ObjectID = require('mongodb').ObjectID;
    app.get('/collection/:collectionName/:id'
    , (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e)
    res.send(result)
    })
    })
    
    
    //update an object 
    
    app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
    {_id: new ObjectID(req.params.id)},
    {$set: req.body},
    {safe: true, multi: false},
    (e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    })
    })
    
    
    
    
    
    app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
    { _id: ObjectID(req.params.id) },(e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ?
    {msg: 'success'} : {msg: 'error'})
    })
    })
    
    

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})