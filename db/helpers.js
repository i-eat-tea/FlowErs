// Shared by db/init.js and db/reset.js. Reads MYSQL_* env vars (same as server.ts).
export function connectionConfig({ requireDatabase = true } = {}) {
  const database = process.env.MYSQL_DATABASE;
  if (requireDatabase && !database) {
    throw new Error('MYSQL_DATABASE is not set. Refusing to guess which database to touch.');
  }
  let ssl;
  if (process.env.MYSQL_SSL === 'true') {
    const ca = process.env.MYSQL_SSL_CA; // optional PEM text (Aiven: paste the project CA certificate)
    ssl = ca
      ? { ca: ca.replace(/\\n/g, '\n'), minVersion: 'TLSv1.2' }
      : { rejectUnauthorized: false, minVersion: 'TLSv1.2' }; // encrypted but cert not verified
  }
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database,
    ssl,
    multipleStatements: true,
  };
}
