// This is a Vercel serverless function that will securely provide the API key
export default function handler(req, res) {
  // Set CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Return the API key from environment variables
  res.status(200).json({ 
    apiKey: process.env.OPENAI_API_KEY || 'API_KEY_NOT_FOUND' 
  });
}
