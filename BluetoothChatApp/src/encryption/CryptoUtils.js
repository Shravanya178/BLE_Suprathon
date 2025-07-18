import CryptoJS from 'crypto-js';

export const generateKey = () => CryptoJS.lib.WordArray.random(32).toString();
export const encryptMessage = (message, key) =>
  CryptoJS.AES.encrypt(message, key).toString();
export const decryptMessage = (cipher, key) =>
  CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
