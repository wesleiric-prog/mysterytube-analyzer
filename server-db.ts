import sqlite3 from 'sqlite3';
import { logger } from './server-logger';

const DB_FILE = 'mystery_channels.db';
const db = new sqlite3.Database(DB_FILE);

export const dbRun = (sql: string, params: unknown[] = []) => {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

export const dbAll = <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows as T[]);
    });
  });
};

export const dbGet = <T>(sql: string, params: unknown[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row as T | undefined);
    });
  });
};

export async function initDb() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT NOT NULL,
      thumbnail TEXT,
      subscribers TEXT,
      last_monitored_at TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      title TEXT NOT NULL,
      thumbnail_url TEXT,
      view_count INTEGER DEFAULT 0,
      duration TEXT,
      published_at TEXT,
      viral_score INTEGER DEFAULT 100,
      analysis TEXT,
      FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      title TEXT NOT NULL,
      concept TEXT NOT NULL,
      script_outline TEXT NOT NULL,
      cinematic_prompt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS scripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_duration TEXT NOT NULL,
      full_script TEXT NOT NULL,
      cinematic_prompts TEXT NOT NULL,
      viral_hooks TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const channelCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM channels');
  if (channelCount?.count !== 0) {
    return;
  }

  logger.info('database.seed.start');

  await dbRun(`
    INSERT INTO channels (id, name, handle, thumbnail, subscribers, last_monitored_at)
    VALUES (
      'UCxsk_Cst6E227Y9C8gZ_Zjw',
      'Filipe Penoni',
      '@FilipePenoni',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      '3.5M inscritos',
      datetime('now')
    )
  `);

  const seededVideos = [
    {
      id: 'vid1',
      channel_id: 'UCxsk_Cst6E227Y9C8gZ_Zjw',
      title: 'O Mistério por trás das Linhas de Nazca: Revelações que a Ciência Esconde',
      thumbnail_url:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      view_count: 850000,
      duration: '18:15',
      published_at: 'Há 5 dias',
      viral_score: 185,
    },
    {
      id: 'vid2',
      channel_id: 'UCxsk_Cst6E227Y9C8gZ_Zjw',
      title: 'Desaparecimentos inexplicáveis no Triângulo das Bermudas: O Caso do Voo 19',
      thumbnail_url:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      view_count: 1200000,
      duration: '22:40',
      published_at: 'Há 12 dias',
      viral_score: 260,
    },
    {
      id: 'vid3',
      channel_id: 'UCxsk_Cst6E227Y9C8gZ_Zjw',
      title: 'O Enigma do Manuscrito Voynich: O Livro que Ninguém Consegue Ler',
      thumbnail_url:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      view_count: 450000,
      duration: '14:50',
      published_at: 'Há 20 dias',
      viral_score: 98,
    },
    {
      id: 'vid4',
      channel_id: 'UCxsk_Cst6E227Y9C8gZ_Zjw',
      title: 'O que Realmente Aconteceu no Incidente do Passo Dyatlov?',
      thumbnail_url:
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
      view_count: 320000,
      duration: '16:02',
      published_at: 'Há 1 mês',
      viral_score: 70,
    },
    {
      id: 'vid5',
      channel_id: 'UCxsk_Cst6E227Y9C8gZ_Zjw',
      title: 'Segredos da Área 51: Fotos confidenciais reveladas recentemente',
      thumbnail_url:
        'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=80',
      view_count: 980000,
      duration: '25:10',
      published_at: 'Há 1 mês',
      viral_score: 213,
    },
  ];

  for (const video of seededVideos) {
    await dbRun(
      `
        INSERT INTO videos (id, channel_id, title, thumbnail_url, view_count, duration, published_at, viral_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        video.id,
        video.channel_id,
        video.title,
        video.thumbnail_url,
        video.view_count,
        video.duration,
        video.published_at,
        video.viral_score,
      ]
    );
  }

  await dbRun(`
    INSERT INTO channels (id, name, handle, thumbnail, subscribers, last_monitored_at)
    VALUES (
      'UC_Colecionador_Ossos_Fake_Id',
      'Arquivo Mistério',
      '@ArquivoMisterio',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
      '1.2M inscritos',
      datetime('now')
    )
  `);

  const seededVideos2 = [
    {
      id: 'vid6',
      channel_id: 'UC_Colecionador_Ossos_Fake_Id',
      title: 'A assustadora história da Ilha das Bonecas no México',
      thumbnail_url:
        'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=600&auto=format&fit=crop&q=80',
      view_count: 620000,
      duration: '15:45',
      published_at: 'Há 3 dias',
      viral_score: 177,
    },
    {
      id: 'vid7',
      channel_id: 'UC_Colecionador_Ossos_Fake_Id',
      title: 'Cidade Fantasma Submersa de Atlântida: Novas ruínas encontradas?',
      thumbnail_url:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      view_count: 350000,
      duration: '19:30',
      published_at: 'Há 10 dias',
      viral_score: 100,
    },
    {
      id: 'vid8',
      channel_id: 'UC_Colecionador_Ossos_Fake_Id',
      title: 'As misteriosas luzes de Hessdalen: O fenômeno sem explicação',
      thumbnail_url:
        'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      view_count: 150000,
      duration: '12:10',
      published_at: 'Há 20 dias',
      viral_score: 42,
    },
  ];

  for (const video of seededVideos2) {
    await dbRun(
      `
        INSERT INTO videos (id, channel_id, title, thumbnail_url, view_count, duration, published_at, viral_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        video.id,
        video.channel_id,
        video.title,
        video.thumbnail_url,
        video.view_count,
        video.duration,
        video.published_at,
        video.viral_score,
      ]
    );
  }

  logger.info('database.seed.complete');
}