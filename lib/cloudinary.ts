import { v2 as cloudinary } from "cloudinary";
import { loadEnv } from "./config";

const env = loadEnv();

function parseCloudinaryUrl(cloudinaryUrl: string) {
  const url = new URL(cloudinaryUrl);
  return {
    cloud_name: url.hostname,
    api_key: decodeURIComponent(url.username),
    api_secret: decodeURIComponent(url.password),
  };
}

export function configureCloudinary() {
  cloudinary.config(parseCloudinaryUrl(env.CLOUDINARY_URL));
  return cloudinary;
}

export function buildSignedUpload() {
  const api = configureCloudinary();
  const creds = parseCloudinaryUrl(env.CLOUDINARY_URL);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "job-classifier/raw";
  const paramsToSign = { timestamp, folder };
  const signature = api.utils.api_sign_request(paramsToSign, creds.api_secret);

  return {
    cloudName: creds.cloud_name,
    apiKey: creds.api_key,
    timestamp,
    folder,
    signature,
  };
}
