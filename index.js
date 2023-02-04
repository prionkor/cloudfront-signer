const express = require('express');
const cf = require('@a1motion/aws-cloudfront-sign');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const signOption = {
	kaypairId: process.env.KEYPAIR_ID,
	privateKeyString: process.env.PRIVATE_KEY,
	expireTime:
		new Date().getTime() + (process.env.DEFAULT_TTL || 60) * 60 * 1000,
};

const validator = [
	body('url').required('URL is required').isUrl('invalid url'),
	body('ttl').optional().isNumber('Invalid ttl. Set number of minuites!'),
];

app.get('/', (_, res) => {
	res.json({ status: 'Ok!' });
});

app.post('/', validator, (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	const options = { ...signOption };
	if (req.body.ttl) {
		options.ttl = parseInt(req.body.ttl, 10);
	}
	const signedUrl = cf.getSignedUrl(req.body.url, options);
	res.json({ ttl: options.ttl, url: options.url, signed: signedUrl });
});

app.listen(port, () => {
	console.log(`Signer listening on port ${port}`);
});
