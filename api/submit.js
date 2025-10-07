// This function acts as a secure proxy to your real webhook endpoint.
// It runs on the server-side in Vercel, so it can safely access environment variables.
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Retrieve webhook configuration from Vercel Environment Variables
    const { WEBHOOK_URL, WEBHOOK_HEADER_NAME, WEBHOOK_HEADER_VALUE } = process.env;

    if (!WEBHOOK_URL) {
        console.error('WEBHOOK_URL environment variable is not set.');
        return res.status(500).json({ message: 'Webhook URL is not configured on the server.' });
    }

    try {
        // Prepare headers for the external webhook request
        const forwardHeaders = {};

        // Forward the Content-Type header from the original request.
        // This is crucial for multipart/form-data to include the boundary.
        if (req.headers['content-type']) {
            forwardHeaders['Content-Type'] = req.headers['content-type'];
        }

        // Add the authentication header if it's configured in environment variables
        if (WEBHOOK_HEADER_NAME && WEBHOOK_HEADER_VALUE) {
            forwardHeaders[WEBHOOK_HEADER_NAME] = WEBHOOK_HEADER_VALUE;
        }

        // Forward the request to the actual webhook URL
        const externalResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: forwardHeaders,
            // Pipe the incoming request body directly to the fetch request
            body: req,
            // This is required for streaming request bodies in Node.js fetch
            duplex: 'half',
        });

        // Try to parse the response from the webhook as JSON, fall back to text
        const responseData = await externalResponse.json().catch(() => externalResponse.text());
        
        // Forward the status code and response from the external webhook back to the client
        res.status(externalResponse.status).json(responseData);

    } catch (error) {
        console.error('Error in webhook proxy function:', error);
        res.status(500).json({ message: 'An internal server error occurred while processing the request.', error: error.message });
    }
}

// Disable Vercel's default body parser to allow streaming the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
