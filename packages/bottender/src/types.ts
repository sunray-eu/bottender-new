import { IncomingHttpHeaders } from 'http';

import { JsonObject } from 'type-fest';

import Bot, { OnRequest } from './bot/Bot';
import Context from './context/Context';
import SessionStore from './session/SessionStore';
import { Connector } from './bot/Connector';
import { LineConnectorOptions } from './line/LineConnector';
import { MessengerConnectorOptions } from './messenger/MessengerConnector';
import { SlackConnectorOptions } from './slack/SlackConnector';
import { TelegramConnectorOptions } from './telegram/TelegramConnector';
import { ViberConnectorOptions } from './viber/ViberConnector';
import { WhatsappConnectorOptions } from './whatsapp/WhatsappConnector';

export type Action<
  C extends Context,
  P extends Record<string, any> = {},
  RAP extends Record<string, any> = {},
> = (
  context: C,
  props: Props<C> & P
) => void | Action<C, RAP> | Promise<Action<C, RAP> | void>;

export type Props<C extends Context> = {
  next?: Action<C, any>;
  error?: Error;
};

export type Plugin<C extends Context> = (context: C) => void;

export enum Channel {
  Messenger = 'messenger',
  Line = 'line',
  Slack = 'slack',
  Telegram = 'telegram',
  Viber = 'viber',
  Whatsapp = 'whatsapp',
}

export enum SessionDriver {
  Memory = 'memory',
  File = 'file',
  Redis = 'redis',
  Mongo = 'mongo',
}

// Define individual store config types
type MemoryStoreConfig = { memory?: { maxSize?: number } };
type FileStoreConfig = { dirname?: string };
type RedisStoreConfig = {
  port?: number;
  host?: string;
  password?: string;
  db?: number;
};
type MongoStoreConfig = { url?: string; collectionName?: string };

// Map driver names to their config types
type StoreConfigs = {
  [SessionDriver.Memory]: MemoryStoreConfig;
  [SessionDriver.File]: FileStoreConfig;
  [SessionDriver.Redis]: RedisStoreConfig;
  [SessionDriver.Mongo]: MongoStoreConfig;
};

// Helper type for extracting store config based on the driver
type StoreConfigForDriver<Driver extends SessionDriver> = {
  [K in Driver]: { driver: K; expiresIn?: number; store: StoreConfigs[K] };
}[Driver];

// Union type for all possible session configurations
export type SessionConfig =
  | StoreConfigForDriver<SessionDriver.Memory>
  | StoreConfigForDriver<SessionDriver.File>
  | StoreConfigForDriver<SessionDriver.Redis>
  | StoreConfigForDriver<SessionDriver.Mongo>;

type ChannelCommonConfig = {
  enabled: boolean;
  path?: string;
  sync?: boolean;
  onRequest?: OnRequest;
};

export type BottenderConfig = {
  plugins?: Plugin<any>[];
  session?: SessionConfig;
  initialState?: JsonObject;
  channels?:
    | {
        messenger?: MessengerConnectorOptions & ChannelCommonConfig;
        line?: LineConnectorOptions & ChannelCommonConfig;
        telegram?: TelegramConnectorOptions & ChannelCommonConfig;
        slack?: SlackConnectorOptions & ChannelCommonConfig;
        viber?: ViberConnectorOptions & ChannelCommonConfig;
        whatsapp?: WhatsappConnectorOptions & ChannelCommonConfig;
      }
    | {
        [key in Exclude<
          string,
          'messenger' | 'line' | 'telegram' | 'slack' | 'viber' | 'whatsapp'
        >]?: {
          connector: Connector<any, any>;
        } & ChannelCommonConfig;
      };
};

export type RequestContext<
  B extends JsonObject = JsonObject,
  H extends Record<string, string | string[] | undefined> = {},
> = {
  id?: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: IncomingHttpHeaders & H;
  rawBody: string;
  body: B;
  params: Record<string, string>;
  url: string;
};

export type Client = object;

export { Event } from './context/Event';

export type ChannelBot = {
  webhookPath: string;
  bot: Bot<any, any, any, any>;
};

export interface ErrorResponse {
  response?: {
    status?: string;
    data?: string;
  };
  message?: string;
}
