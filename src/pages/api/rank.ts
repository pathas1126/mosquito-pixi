import { MongoClient, ServerApiVersion, WithId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

export type Rank = {
  date: string;
  record: number;
  ip: string;
  isMe?: boolean;
  _id: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      let client;
      try {
        client = new MongoClient(process.env.ATLAS_URL as string, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          },
        });
        await client.connect();
        const database = client.db('mosquito');

        const rankCollection = database.collection('rank');
        const ip = req.headers['x-forwarded-for'];
        const { date, record } = req.query;

        const recordNumber = Number(record);

        const target = await rankCollection.findOne({
          date,
        });

        if (!target) {
          await rankCollection.insertOne({ ip, record: recordNumber, date });
          return res.status(200).json({
            data: {
              isMe: true,
              ip,
              date,
              record: recordNumber,
            },
          });
        }

        const won = target.record < recordNumber;

        if (won) {
          const updateResult = await rankCollection.updateOne({ _id: target._id }, { $set: { record: recordNumber, ip } });
          if (updateResult.matchedCount >= 1)
            return res.status(200).json({
              data: {
                isMe: true,
                ip,
                date,
                record: recordNumber,
              },
            });
        }

        return res.status(200).json({
          data: {
            isMe: target.ip === ip,
            ip: target.ip,
            date: target.date,
            record: target.record,
          },
        });
      } catch (error) {
        console.error(error);
        res.status(200).json({ data: null });
      } finally {
        await client?.close();
      }
      break;
  }
}
