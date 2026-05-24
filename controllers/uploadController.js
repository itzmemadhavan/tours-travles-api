const { DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const db = require('../config/db');

// Upload Single File
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, location } = req.file;

    // Save to database
    const [id] = await db('uploaded_files').insert({
      file_name: originalname,
      file_url: location, // multer-s3 returns location instead of path
      file_type: mimetype,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: { id, file_name: originalname, file_url: location, file_type: mimetype }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error during upload', error: error.message });
  }
};

// Upload Multiple Files
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileRecords = req.files.map(file => ({
      file_name: file.originalname,
      file_url: file.location,
      file_type: file.mimetype,
    }));

    // Save all to DB
    await db('uploaded_files').insert(fileRecords);

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: fileRecords
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server Error during upload', error: error.message });
  }
};

// Delete File from S3
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file from DB
    const file = await db('uploaded_files').where({ id }).first();
    if (!file) {
      return res.status(404).json({ message: 'File not found in database' });
    }

    // Extract S3 key from URL
    // e.g., https://amzn-maddy.s3.ap-southeast-2.amazonaws.com/uploads/123-456.jpg
    const bucketUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    let key = file.file_url.replace(bucketUrl, '');

    // Sometimes the region format might vary or it might use path style. Safest is to parse URL
    if (file.file_url.includes('amazonaws.com')) {
      const urlParts = new URL(file.file_url);
      // pathname has a leading slash, slice it
      key = urlParts.pathname.slice(1);
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);

    // Delete from DB
    await db('uploaded_files').where({ id }).del();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server Error during delete', error: error.message });
  }
};

// Get Uploaded File Details
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await db('uploaded_files').where({ id }).first();
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json({ file });
  } catch (error) {
    console.error('Fetch File Error:', error);
    res.status(500).json({ message: 'Server Error fetching file', error: error.message });
  }
};

// Proxy Image from S3 (bypasses S3 public block)
exports.streamImage = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');

    // Extract key from URL
    const urlParts = new URL(url);
    const key = urlParts.pathname.slice(1); // remove leading slash

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const s3Response = await s3Client.send(command);
    
    // Set headers
    res.set('Content-Type', s3Response.ContentType);
    res.set('Content-Length', s3Response.ContentLength);
    
    // Stream data to client
    s3Response.Body.pipe(res);
  } catch (error) {
    console.error('Stream Image Error:', error);
    res.status(404).send('Image not found');
  }
};
