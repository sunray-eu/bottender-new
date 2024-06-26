import { Collection, Db, Document, MongoClient } from 'mongodb';
import { isBefore, subMinutes } from 'date-fns';

import Session from './Session';
import SessionStore from './SessionStore';

type MongoOption =
  | string
  | {
      url?: string;
      collectionName?: string;
    };

export default class MongoSessionStore implements SessionStore {
  _url: string;

  _collectionName: string;

  // The number of minutes to store the data in the session.
  _expiresIn: number;

  _connection?: Db;

  constructor(options: MongoOption, expiresIn?: number) {
    if (typeof options === 'string') {
      this._url = options;
      this._collectionName = 'sessions';
    } else {
      this._url = options.url || 'mongodb://localhost:27017';
      this._collectionName = options.collectionName || 'sessions';
    }
    this._expiresIn = expiresIn || 0;
  }

  async init(): Promise<MongoSessionStore> {
    this._connection = (await MongoClient.connect(this._url)).db();

    return this;
  }

  async read(key: string): Promise<Session | null> {
    const filter = { id: key };
    try {
      const session = await this._sessions.findOne(filter);

      if (session && this._expired(session)) {
        return null;
      }

      return session;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async all(): Promise<Session[]> {
    return this._sessions.find().toArray();
  }

  async write(key: string, sess: Session): Promise<void> {
    const filter = { id: key };

    sess.lastActivity = Date.now();

    try {
      await this._sessions.updateOne(
        filter,
        { $set: sess },
        {
          upsert: true,
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  async destroy(key: string): Promise<void> {
    const filter = { id: key };
    try {
      await this._sessions.deleteOne(filter);
    } catch (err) {
      console.error(err);
    }
  }

  _expired(sess: Session): boolean {
    if (!this._expiresIn) {
      return false;
    }

    return (
      sess.lastActivity !== undefined &&
      isBefore(sess.lastActivity, subMinutes(Date.now(), this._expiresIn))
    );
  }

  get _sessions(): Collection<Document> {
    if (this._connection == null) {
      throw new Error(
        'MongoSessionStore: must call `init` before any operation.'
      );
    }
    return this._connection.collection(this._collectionName);
  }
}
