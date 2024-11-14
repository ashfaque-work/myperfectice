import { Injectable } from '@nestjs/common';
import { createHash, createCipheriv, createDecipheriv, publicEncrypt, privateDecrypt, constants } from 'crypto';

@Injectable()
export class CcavUtil {
  encrypt(plainText: string, workingKey: string): string {
    const m = createHash('md5');
    m.update(workingKey);
    const key = m.digest();
    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const cipher = createCipheriv('aes-128-cbc', key, iv);
    let encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
  }

  decrypt(encText: string, workingKey: string): string {
    const m = createHash('md5');
    m.update(workingKey);
    const key = m.digest();
    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const decipher = createDecipheriv('aes-128-cbc', key, iv);
    let decoded = decipher.update(encText, 'hex', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  }

  encryptWithRsaPublicKey(toEncrypt: string, rsaKey: string): string {
    const buffer = Buffer.from(toEncrypt);
    const encrypted = publicEncrypt({ key: rsaKey, padding: constants.RSA_PKCS1_PADDING }, buffer);
    return encrypted.toString('base64');
  }

  decryptWithRsaPrivateKey(toDecrypt: string, rsaKey: string): string {
    const buffer = Buffer.from(toDecrypt, 'base64');
    const decrypted = privateDecrypt(rsaKey, buffer);
    return decrypted.toString('utf8');
  }
}
