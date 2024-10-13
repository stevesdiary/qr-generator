const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require ('dotenv').config();
const Event = require('./models/Event');
const { encrypt, decrypt } = require('./utils/crypto');
const sharp = require('sharp');
const winston = require('winston');
const logger = require('./utils/logger');
const jsqr = require('jsqr');
const multer = require('multer');
const QRCode = require('qrcode');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); 
const port = process.env.PORT || 3100;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventdb', {

})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Failed to connect to MongoDB', err));

app.post('/generate-qrcode', async (req, res) => {
    const { date, time, venue, ticketNumber } = req.body;
    if (!date || !time || !venue || !ticketNumber) {
        return res.status(400).json({ message: 'Missing event details' });
    }

    try {
			const event = new Event({ date, time, venue, ticketNumber });
			await event.save();
			
			const eventData = (JSON.stringify({ date, time, venue, ticketNumber }));
		
			const qrCodeUrl = await QRCode.toDataURL(eventData);
			res.status(200).json({ qrCode: qrCodeUrl });
    } catch (err) {
			console.log("Error ocurred", err);
			res.status(500).json({ message: 'QR code generation failed', error: err.message });
    }
});

app.post('/decode-qrcode', upload.single('qrCodeImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'QR code image is missing' });
  }

  try {
    const { data, info } = await sharp(req.file.buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

			const code = jsqr(new Uint8ClampedArray(data), info.width, info.height);

    if (!code) {
      return res.status(400).json({ message: 'No QR code detected' });
    }
		// console.log(JSON.stringify(code.data))
    return res.status(200).json({ message: 'QR code decoded successfully', data: code.data});
    
  } catch (err) {
		console.error(err);
    return res.status(500).json({ message: 'Error processing QR code image', error: err.message });
  }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
