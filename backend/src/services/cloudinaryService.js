import cloudinary from '../config/cloudinary.js';
import axios from 'axios';
import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Service handling Cloudinary asset uploads, removals, and buffer fetching.
 */
export const uploadFile = async (fileBuffer, options = {}) => {
  const isCloudinaryConfigured = Boolean(
    env.CLOUDINARY_CLOUD_NAME && 
    env.CLOUDINARY_API_KEY && 
    env.CLOUDINARY_API_SECRET &&
    env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud'
  );

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resourceType || 'auto',
          folder: options.folder || 'securedms_docs',
          public_id: options.publicId,
          ...options,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Service] Upload error:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Demo fallback when Cloudinary API credentials are not provided
  const randomId = crypto.randomBytes(8).toString('hex');
  const simulatedPublicId = `securedms_docs/${options.filename ? options.filename.replace(/\.[^/.]+$/, '') : 'doc'}_${randomId}`;
  const simulatedUrl = `https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/${simulatedPublicId}.pdf`;

  return {
    url: simulatedUrl,
    publicId: simulatedPublicId,
    bytes: fileBuffer ? fileBuffer.length : 1024,
    format: options.format || 'pdf',
  };
};

/**
 * Deletes file from Cloudinary storage.
 * @param {string} publicId 
 * @returns {Promise<any>}
 */
export const deleteFile = async (publicId) => {
  if (!publicId) return null;

  const isCloudinaryConfigured = Boolean(
    env.CLOUDINARY_CLOUD_NAME && 
    env.CLOUDINARY_API_KEY && 
    env.CLOUDINARY_API_SECRET &&
    env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud'
  );

  if (isCloudinaryConfigured) {
    return await cloudinary.uploader.destroy(publicId);
  }

  return { result: 'ok (demo fallback)' };
};

/**
 * Downloads a file from remote URL into memory Buffer.
 * @param {string} url 
 * @returns {Promise<Buffer>}
 */
export const getFileBuffer = async (url) => {
  if (!url) {
    throw new Error('URL is required to fetch file buffer');
  }

  if (url.startsWith('data:')) {
    const base64Data = url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15000,
  });

  return Buffer.from(response.data);
};

export default {
  uploadFile,
  deleteFile,
  getFileBuffer,
};
