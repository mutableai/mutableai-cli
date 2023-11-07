const axios = require("axios").default;
const os = require("os");
const dotenv = require("dotenv");
const path = require("path") as typeof import("path");
const { subtle } = require("node:crypto")
  .webcrypto as typeof import("node:crypto");

async function authenticate(
  userEmail: string,
  authKey: string
): Promise<boolean> {
  try {
    const url = "https://auth-staging.mutableai.io";
    const { data } = await axios.post(url, {
      mode: "match",
      user_email: userEmail,
      auth_key: authKey,
    });
    return data.is_matched;
  } catch (error) {
    console.error("[Error] Failed to call auth service");
    return false;
  }
}

async function getStoredKeyAndUserEmail(): Promise<{
  userEmail: string;
  authKey: string;
}> {
  dotenv.config({ path: path.resolve(os.homedir() + "/.mutableai") });

  try {
    if (!process.env.USER_EMAIL || !process.env.USER_KEY) {
      throw new Error(
        "Unable to retrieve your auth key and user email. Please make sure you have ~/.mutableai setup"
      );
    }
    return {
      userEmail: process.env.USER_EMAIL,
      authKey: process.env.USER_KEY,
    };
  } catch (error) {
    throw new Error(
      "[Error] Unable to retrieve your auth key and user email. Please make sure you have ~/.mutableai setup"
    );
  }
}

async function getSupabaseUrlAndKey(
  userEmail: string,
  authKey: string
): Promise<{ supabaseUrl: string; supabaseApiKey: string }> {
  try {
    const url = "https://auth-staging.mutableai.io";
    const { data } = await axios.post(url, {
      mode: "retrieve_supabase",
      user_email: userEmail,
      auth_key: authKey,
    });
    const decryptedSupabaseUrl = await decryptMessageWithAuthKey(
      authKey,
      data.supabase_url,
      data.iv
    );
    const decryptedSupabaseApiKey = await decryptMessageWithAuthKey(
      authKey,
      data.supabase_api_key,
      data.iv
    );
    return {
      supabaseUrl: decryptedSupabaseUrl,
      supabaseApiKey: decryptedSupabaseApiKey,
    };
  } catch (error) {
    console.error("[ERROR] Failed to retrieve supabase keys");
    return { supabaseUrl: "", supabaseApiKey: "" };
  }
}

export async function decryptMessageWithAuthKey(
  authKey: string,
  encryptedMsg: string,
  input_iv: string
): Promise<string> {
  try {
    const keyBuffer = hexStringToBuffer(authKey);
    const key = await subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const encryptedBuffer = hexStringToBuffer(encryptedMsg);

    const decryptedData = await subtle.decrypt(
      { name: "AES-GCM", iv: hexStringToBuffer(input_iv) },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    const decryptedMsg = decoder.decode(decryptedData);

    return decryptedMsg;
  } catch (err) {
    console.error("[ERROR] failed to decrypt message with auth key");
    throw err;
  }
}

function hexStringToBuffer(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes.buffer;
}

export {};
exports.authenticate = authenticate;
exports.getStoredKeyAndUserEmail = getStoredKeyAndUserEmail;
exports.getSupabaseUrlAndKey = getSupabaseUrlAndKey;
