import {
  readBackupEncryptionConfig,
  readBackupS3Config,
  type BackupConfig,
} from './recovery-crypto';

export type BackupTargetName = 'primary' | 'secondary';

export type BackupTargetConfig = {
  name: BackupTargetName;
  config: BackupConfig;
};

const SECONDARY_ENDPOINT_VARIABLE = 'BACKUP_SECONDARY_S3_ENDPOINT';

/**
 * Liest die konfigurierten Backup-Ziele (Säule 9 N2): das bestehende BACKUP_S3_*-Set als
 * primäres Ziel und — nur wenn BACKUP_SECONDARY_S3_ENDPOINT gesetzt ist — das
 * BACKUP_SECONDARY_S3_*-Set als zweites, unabhängiges Ziel. Ohne Sekundär-Ziel verhält
 * sich der Runner exakt wie im Einzelziel-Fall (kein Breaking Change). Beide Ziele teilen
 * sich den Verschlüsselungsschlüssel; die Storage-Credentials bleiben getrennt.
 */
export function readBackupTargets(
  environment: Record<string, string | undefined>,
): BackupTargetConfig[] {
  const encryption = readBackupEncryptionConfig(environment);
  const targets: BackupTargetConfig[] = [
    {
      name: 'primary',
      config: { ...encryption, s3: readBackupS3Config(environment, 'BACKUP') },
    },
  ];

  if (environment[SECONDARY_ENDPOINT_VARIABLE]?.trim()) {
    targets.push({
      name: 'secondary',
      config: { ...encryption, s3: readBackupS3Config(environment, 'BACKUP_SECONDARY') },
    });
  }

  return targets;
}
