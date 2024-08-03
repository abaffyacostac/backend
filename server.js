const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://abaffyacostac:yAjh2GwjRXwgIDYK@cluster0.d0mojbq.mongodb.net/Auction?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Modelo de Producto
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  minOffer: Number,
  currentBid: Number,
  bidHistory: [{
    name: String,
    bid: Number,
    date: { type: Date, default: Date.now }
  }]
});

const Product = mongoose.model('Product', productSchema);

// Rutas
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  console.log(products);
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.post('/api/products/:id/bid', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const { bid, name } = req.body;

  if (bid > product.currentBid) {
    product.currentBid = bid;
    console.log(name, bid);
    product.bidHistory.push({ name, bid });
    await product.save();
    res.json(product);
  } else {
    res.status(400).json({ message: 'Bid must be higher than current bid' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

