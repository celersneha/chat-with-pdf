import AWS from "aws-sdk";

// Configure AWS SDK for Filebase
const s3 = new AWS.S3({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.com",
  accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID!,
  secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY!,
  region: process.env.FILEBASE_REGION || "us-east-1",
  s3ForcePathStyle: true,
});

const bucketName = process.env.FILEBASE_BUCKET || "pdfiq-assets";

export const uploadPdfToFilebase = async (
  buffer: Buffer,
  fileName: string,
  userId: string,
  fileId: string
) => {
  const sanitiseString = (str: string) => {
    return str.replace(/[^a-zA-Z0-9-_\.]/g, "_");
  };

  const sanitizedFileName = sanitiseString(fileName);
  const sanitizedUserId = sanitiseString(userId);

  const fileKey = `pdfs/${sanitizedUserId}/${fileId}_${sanitizedFileName}_${Date.now()}.pdf`;

  try {
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: "application/pdf",
      Metadata: {
        userId: userId,
        fileId: fileId,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
      ACL: "public-read",
    };

    // Upload file
    const result = await s3.upload(uploadParams).promise();

    // Ab CID nikalne ke liye ek HEAD request
    const headData = await s3
      .headObject({
        Bucket: bucketName,
        Key: fileKey,
      })
      .promise();

    const ipfsCid = headData.Metadata?.cid || null;

    // Bucket-based URL
    const publicUrl = `${process.env.FILEBASE_ENDPOINT}/${bucketName}/${fileKey}`;

    // IPFS-based URL (global access)
    const ipfsUrl = ipfsCid ? `https://ipfs.filebase.io/ipfs/${ipfsCid}` : null;

    return {
      url: publicUrl, // Filebase bucket URL
      filebaseKey: fileKey, // Path in bucket
      bucket: bucketName,
      ipfsCid, // ✅ real IPFS CID
      ipfsUrl, // ✅ IPFS gateway URL
      location: result.Location,
    };
  } catch (error) {
    console.error("Error uploading to Filebase:", error);
    throw error;
  }
};

export const deleteFromFilebase = async (fileKey: string) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileKey,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`File ${fileKey} deleted from Filebase`);
  } catch (error) {
    console.error("Error deleting from Filebase:", error);
    throw error;
  }
};

export const generateSignedUrl = async (
  fileKey: string,
  expirationSeconds = 3600 // 1 hour
) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Expires: expirationSeconds,
    };

    const signedUrl = s3.getSignedUrl("getObject", params);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

export const getFileInfo = async (fileKey: string) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const result = await s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      metadata: result.Metadata,
    };
  } catch (error) {
    console.error("Error getting file info:", error);
    throw error;
  }
};
