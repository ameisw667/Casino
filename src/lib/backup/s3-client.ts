import { createSignedS3PutRequest, type BackupConfig } from './recovery-crypto';

export async function uploadS3Object(input: {
  config: BackupConfig;
  objectKey: string;
  body: Buffer;
  contentType: 'application/octet-stream' | 'application/json';
  now: Date;
  fetchImpl?: typeof fetch;
}): Promise<void> {
  const signed = createSignedS3PutRequest({
    config: input.config,
    objectKey: input.objectKey,
    body: input.body,
    now: input.now,
  });
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(signed.url, {
    method: 'PUT',
    headers: { ...signed.headers, 'content-type': input.contentType },
    body: new Uint8Array(input.body),
  });

  if (!response.ok) throw new Error('Offsite backup upload failed');
}
