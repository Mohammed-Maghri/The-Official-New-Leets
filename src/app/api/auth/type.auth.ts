import CryptoJS from "crypto-js";

interface AuthResponse {
  access_token: string;
}

const EncryptionFunction = (token: string) => {
  const ciphertext = CryptoJS.AES.encrypt(
    token,
    process.env.SECRET_KEY as string
  ).toString();
  return ciphertext;
};

const DecryptionFunction = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(
    ciphertext,
    process.env.SECRET_KEY as string
  );
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};


export type { AuthResponse };
export { EncryptionFunction, DecryptionFunction };
