import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';

export type EncryptedArtifact = {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
};

export type BackupConfig = {
  encryptionKey: Buffer;
  s3: {
    endpoint: URL;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    prefix: string;
  };
  includeRoles: boolean;
};

type BackupEnvironment = Record<string, string | undefined>;

function required(environment: BackupEnvironment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required backup configuration: ${name}`);
  return value;
}

function parseEncryptionKey(encoded: string): Buffer {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) {
    throw new Error('BACKUP_ENCRYPTION_KEY_BASE64 must decode to exactly 32 bytes');
  }
  return key;
}

function parseEndpoint(value: string): URL {
  let endpoint: URL;
  try {
    endpoint = new URL(value);
  } catch {
    throw new Error('BACKUP_S3_ENDPOINT must be a valid HTTPS URL');
  }

  if (
    endpoint.protocol !== 'https:' ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new Error('BACKUP_S3_ENDPOINT must be a credential-free HTTPS URL');
  }

  return endpoint;
}

function parseBucket(value: string): string {
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(value)) {
    throw new Error('BACKUP_S3_BUCKET must be a valid bucket name');
  }
  return value;
}

function parsePrefix(value: string | undefined): string {
  const prefix = value?.trim() || 'casino-recovery';
  if (!/^[a-z0-9][a-z0-9/_-]*[a-z0-9]$/.test(prefix)) {
    throw new Error('BACKUP_S3_PREFIX contains unsupported characters');
  }
  return prefix.replace(/\/+$/, '');
}

export function readBackupConfig(environment: BackupEnvironment): BackupConfig {
  return {
    encryptionKey: parseEncryptionKey(required(environment, 'BACKUP_ENCRYPTION_KEY_BASE64')),
    s3: {
      endpoint: parseEndpoint(required(environment, 'BACKUP_S3_ENDPOINT')),
      bucket: parseBucket(required(environment, 'BACKUP_S3_BUCKET')),
      region: required(environment, 'BACKUP_S3_REGION'),
      accessKeyId: required(environment, 'BACKUP_S3_ACCESS_KEY_ID'),
      secretAccessKey: required(environment, 'BACKUP_S3_SECRET_ACCESS_KEY'),
      prefix: parsePrefix(environment.BACKUP_S3_PREFIX),
    },
    includeRoles: environment.BACKUP_INCLUDE_ROLES === 'true',
  };
}

export function encryptArtifact(plaintext: Buffer, key: Buffer): EncryptedArtifact {
  if (key.length !== 32) throw new Error('AES-256-GCM requires a 32 byte key');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  return {
    ciphertext: Buffer.concat([cipher.update(plaintext), cipher.final()]),
    iv,
    authTag: cipher.getAuthTag(),
  };
}

export function decryptArtifact(artifact: EncryptedArtifact, key: Buffer): Buffer {
  if (key.length !== 32) throw new Error('AES-256-GCM requires a 32 byte key');
  if (artifact.iv.length !== 12) throw new Error('AES-256-GCM requires a 96-bit IV');
  if (artifact.authTag.length !== 16) throw new Error('AES-256-GCM requires a 128-bit auth tag');
  const decipher = createDecipheriv('aes-256-gcm', key, artifact.iv);
  decipher.setAuthTag(artifact.authTag);
  return Buffer.concat([decipher.update(artifact.ciphertext), decipher.final()]);
}
export type BackupManifestInput = {
  createdAt: string;
  cliVersion: string;
  keyVersion: string;
  artifacts: Array<{
    name: string;
    ciphertext: Buffer;
    iv: Buffer;
    authTag: Buffer;
  }>;
};

export function buildBackupManifest(input: BackupManifestInput) {
  return {
    formatVersion: 1,
    createdAt: input.createdAt,
    cliVersion: input.cliVersion,
    keyVersion: input.keyVersion,
    recoveryBoundaries: ['auth', 'storage'],
    artifacts: input.artifacts.map((artifact) => ({
      name: artifact.name,
      bytes: artifact.ciphertext.length,
      sha256: createHash('sha256').update(artifact.ciphertext).digest('hex'),
      ivBase64: artifact.iv.toString('base64'),
      authTagBase64: artifact.authTag.toString('base64'),
    })),
  };
}
function awsEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

function awsTimestamp(now: Date): string {
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function canonicalObjectPath(config: BackupConfig, objectKey: string): string {
  if (!/^[a-z0-9][a-z0-9/_.-]*[a-z0-9]$/i.test(objectKey) || objectKey.includes('..')) {
    throw new Error('Backup object key is invalid');
  }

  const endpointPath = config.s3.endpoint.pathname.replace(/\/+$/, '');
  const encodedKey = objectKey.split('/').map(awsEncode).join('/');
  return `${endpointPath}/${awsEncode(config.s3.bucket)}/${encodedKey}`.replace(/\/\/{2,}/g, '/');
}

function signS3Request(input: {
  config: BackupConfig;
  objectKey: string;
  method: 'PUT' | 'GET';
  payloadHash: string;
  now: Date;
}): { url: string; headers: Record<string, string> } {
  const { config, objectKey, method, payloadHash, now } = input;
  const canonicalUri = canonicalObjectPath(config, objectKey);
  const timestamp = awsTimestamp(now);
  const date = timestamp.slice(0, 8);
  const host = config.s3.endpoint.host;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${timestamp}\n`;
  const credentialScope = `${date}/${config.s3.region}/s3/aws4_request`;
  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${createHash('sha256')
    .update(canonicalRequest, 'utf8')
    .digest('hex')}`;
  const dateKey = hmac(`AWS4${config.s3.secretAccessKey}`, date);
  const regionKey = hmac(dateKey, config.s3.region);
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = hmac(signingKey, stringToSign).toString('hex');

  return {
    url: `${config.s3.endpoint.origin}${canonicalUri}`,
    headers: {
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': timestamp,
      authorization: `AWS4-HMAC-SHA256 Credential=${config.s3.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

export function createSignedS3PutRequest(input: {
  config: BackupConfig;
  objectKey: string;
  body: Buffer;
  now: Date;
}): { url: string; headers: Record<string, string> } {
  return signS3Request({
    config: input.config,
    objectKey: input.objectKey,
    method: 'PUT',
    payloadHash: createHash('sha256').update(input.body).digest('hex'),
    now: input.now,
  });
}

export function createSignedS3GetRequest(input: {
  config: BackupConfig;
  objectKey: string;
  now: Date;
}): { url: string; headers: Record<string, string> } {
  return signS3Request({
    config: input.config,
    objectKey: input.objectKey,
    method: 'GET',
    payloadHash: createHash('sha256').digest('hex'),
    now: input.now,
  });
}
