import { createSignedS3GetRequest, type BackupConfig } from './recovery-crypto';

const MAX_DOWNLOAD_BYTES = 512 * 1024 * 1024;

export async function downloadS3Object(input: {
  config: BackupConfig;
  objectKey: string;
  now: Date;
  fetchImpl?: typeof fetch;
}): Promise<Buffer> {
  const signed = createSignedS3GetRequest({
    config: input.config,
    objectKey: input.objectKey,
    now: input.now,
  });
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(signed.url, {
    method: 'GET',
    headers: signed.headers,
  });

  if (!response.ok) throw new Error('Offsite backup download failed');
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length > MAX_DOWNLOAD_BYTES) {
    throw new Error('Offsite backup download exceeded the size limit');
  }
  return body;
}
