require("dotenv").config({ path: __dirname + '/.env' });

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require('mongoose'); // <-- NEW
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json()); // <-- NEW (important for parsing JSON)
app.use(express.urlencoded({ extended: true }));

const API_KEY = process.env.API_KEY;

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Saved Article Schema and Model
const SavedArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    urlToImage: { type: String },
    publishedAt: { type: Date, required: true },
    sourceName: { type: String }
});

const SavedArticle = mongoose.model('SavedArticle', SavedArticleSchema);

function fetchNews(url, res) {
    axios.get(url)
        .then(response => {
            if (response.data.totalResults > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Successfully fetched the data",
                    data: response.data
                });
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "No more results to show"
                });
            }
        })
        .catch(error => {
            res.json({
                status: 500,
                success: false,
                message: "Failed to fetch data from API",
                error: error.message
            });
        });
}

// News fetching APIs
app.get("/all-news", (req, res) => {
    let pageSize = parseInt(req.query.pagesize) || 40;
    let page = parseInt(req.query.page) || 1;
    let url = `https://newsapi.org/v2/everything?q=page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url, res);
});

app.options("/top-headlines", cors());
app.get("/top-headlines", (req, res) => {
    let pageSize = parseInt(req.query.pagesize) || 40;
    let page = parseInt(req.query.page) || 1;
    let category = req.query.category || "general";
    let url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url, res);
});

app.options("/country/:iso", cors());
app.get("/country/:iso", (req, res) => {
    let pageSize = parseInt(req.query.pagesize) || 40;
    let page = parseInt(req.query.page) || 1;
    const country = req.params.iso;
    let category = req.query.category || 'general';
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url, res);
});

// -------------------- CRUD Routes for Saved Articles --------------------

// Save (Create) an article
app.post('/save-article', async (req, res) => {
    try {
        const { title, description, url, urlToImage, publishedAt, sourceName } = req.body;
        
        // Avoid duplicate URLs
        const existing = await SavedArticle.findOne({ url });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Article already saved.' });
        }

        const article = new SavedArticle({ title, description, url, urlToImage, publishedAt, sourceName });
        const saved = await article.save();
        res.json({ success: true, message: 'Article saved successfully', data: saved });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Read (Get) all saved articles
app.get('/saved-news', async (req, res) => {
    console.log('GET /saved-news route hit');
    try {
        const articles = await SavedArticle.find();
        res.json({ success: true, data: articles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete a saved article by ID
app.delete('/saved-article/:id', async (req, res) => {
   
    try {
        const deleted = await SavedArticle.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Article not found.' });
        }
        res.json({ success: true, message: 'Article deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// -------------------- CRUD Routes End --------------------

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
