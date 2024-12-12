const express = require('express');
const app = express();
app.use(express.json());
app.set('port', 3000);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://budarachamudi:chamu202@cluster0.jitrk.mongodb.net/', (err, client) => {
    db = client.db('Webstore');
});
var staticPath = path.resolve(__dirname, "assets");
app.use('/assets', express.static(staticPath));
app.use('/assets', (req, res) => {
    res.status(404).send('File Not Found');
});
app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});
app.post('/collection/Orders', async (req, res) => {
    const newOrder = req.body;
    try {
        const result = await db.collection('Orders').insertOne(newOrder);
        res.status(200).json({ success: true, message: "Order placed successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: "An error occurred." });
    }
});
app.get('/collection/:collectionName/:id', (req, res) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});
app.put('/collection/:collectionName/:id', (req, res) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e);
            res.send(result.result.n === 1 ? { msg: 'success' } : { msg: 'error' });
        }
    );
});
app.delete('/collection/:collectionName/:id', (req, res) => {
    req.collection.deleteOne(
        { _id: new ObjectID(req.params.id) }, 
        (e, result) => {
            if (e) return next(e);
            res.send(result.result.n === 1 ? { msg: 'success' } : { msg: 'error' });
        }
    );
});
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
app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
});
app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000');
});

