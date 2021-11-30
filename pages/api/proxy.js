export default async function handler(req, res) {

    const body = req.body
    const method = req.headers['x-proxy-method']
    const uri = req.headers['x-proxy-uri']

    if (!method || !uri) {

        return res.status(501)

    }

    if (req.method !== 'POST') {

        return res.status(501)

    }

    if (req.method === 'POST') {

        const options = { method }

        if (method === 'POST') {
            options.body = body
        }
        
        const response = await fetch(uri, options)
        const parsed = await response.json()

        return res.status(200).json(parsed)
    }
}