// --- START: New content for api/servers.js ---

const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

// Define the list of websites that are allowed to make requests
const whitelist = [
  'https://animod.dev',
  'https://www.animod.dev',
  'http://localhost:5173'
];

module.exports = async (req, res) => {
  // --- CORS Check Logic ---
  const origin = req.headers.origin;
  if (whitelist.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // If the origin is not in the whitelist, block it
    return res.status(403).json({ error: 'This origin is not allowed by CORS' });
  }
  // Let the browser know which headers it can expect in the response
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // --- End CORS Check ---


  try {
    const animeId = req.query.id;
    const ep = req.query.ep;
    const response = await axios.get(
      `${process.env.GOGOANIME_URL}/${animeId}-episode-${ep}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        },
      }
    );
    const $ = cheerio.load(response.data);
    const servers = [];
    $('div.anime_muti_link > ul > li').each((i, el) => {
      const server = $(el).find('a').attr('data-video');
      servers.push(server);
    });
    
    // You don't need to set the header again here. We did it at the top.
    res.status(200).json(servers);
    
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// --- END: New content ---