import { EventEmitter } from 'events';
import { IncomingHttpHeaders } from 'http';

import { JsonObject, JsonValue } from 'type-fest';
import { PlainObject } from '@sunray-eu/messaging-api-common';

import Bot, { OnRequest } from './bot/Bot';
import Context, { Response } from './context/Context';
import SessionStore from './session/SessionStore';
import { Connector } from './bot/Connector';
import { Event } from './context/Event';
import { LineConnectorOptions } from './line/LineConnector';
import { MessengerConnectorOptions } from './messenger/MessengerConnector';
import { SlackConnectorOptions } from './slack/SlackConnector';
import { TelegramConnectorOptions } from './telegram/TelegramConnector';
import { ViberConnectorOptions } from './viber/ViberConnector';
import { WhatsappConnectorOptions } from './whatsapp/WhatsappConnector';

export type Action<
  C extends Context,
  P extends object = object,
  // This was not used at all, removed
  // RAP extends Record<string, unknown> = Record<string, unknown>,
> = (
  context: C | C[],
  props: Props<C> & P
) => void | Action<C> | Promise<Action<C> | void>;

export type Props<C extends Context> = {
  next?: Action<C>;
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
type MemoryStoreConfig = { maxSize?: number };
type FileStoreConfig = { dirname?: string };
type RedisStoreConfig = {
  port?: number;
  host: string;
  password?: string;
  db: number;
};
type MongoStoreConfig = { url: string; collectionName: string };

// Map driver names to their config types
type StoreConfigs = {
  [SessionDriver.Memory]: MemoryStoreConfig;
  [SessionDriver.File]: FileStoreConfig;
  [SessionDriver.Redis]: RedisStoreConfig;
  [SessionDriver.Mongo]: MongoStoreConfig;
};

// Utility type to convert a union type to an intersection type
// type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
//   x: infer I
// ) => void
//   ? I
//   : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KeyCombos<T, O = T> = T extends infer U
  ?
      | [T]
      // eslint-disable-next-line @typescript-eslint/no-shadow
      | (KeyCombos<Exclude<O, U>> extends infer U extends any[]
          ? U extends U
            ? [T | U[number]]
            : never
          : never)
  : never;

type SessionDriverCombinations = KeyCombos<SessionDriver>;

// Helper type for extracting store config based on the driver
type StoreConfigForDriver<Drivers extends SessionDriver[]> = {
  [index in keyof Drivers]: {
    driver: Drivers[index];
    store: Pick<StoreConfigs, Drivers[index]>;
  };
}[number];

// Union type for all possible session configurations

export type SessionConfig = {
  expiresIn?: number;
} & StoreConfigForDriver<SessionDriverCombinations>;

export enum TimerMode {
  Extend,
  Refresh,
}

export interface TimerOptions {
  enabled: boolean;
  seenAlwaysAfterFirst?: boolean;
  showSeenBeforeEndMs?: number;
  showTypingBeforeEndMs?: number;
  initialDuration: number;
  extendDuration: number;
  mode: TimerMode;
}

type ChannelCommonConfig = {
  enabled: boolean;
  timer: TimerOptions;
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
  B extends object | undefined = object,
  H extends Record<string, string | string[] | undefined> = any,
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

export { Event };

export type Builder<C extends Context> = {
  build: () => Action<C, any>;
};

export type RequestHandler<B> = (
  body: B,
  requestContext?: RequestContext
) => void | Promise<Response | void>;

export interface IBot<
  B extends Record<string, JsonValue> | PlainObject =
    | Record<string, JsonValue>
    | PlainObject,
  C extends Client = Client,
  E extends Event = Event,
  Ctx extends Context<C, E> = Context<C, E>,
> {
  connector: Connector<B, C>;
  sessions: SessionStore;
  handler: Action<Ctx, any> | null;
  emitter: EventEmitter;

  onEvent(handler: Action<Ctx, any> | Builder<Ctx>): Bot<B, C, E, Ctx>;
  onError(handler: Action<Ctx, any> | Builder<Ctx>): Bot<B, C, E, Ctx>;
  setInitialState(initialState: JsonObject): Bot<B, C, E, Ctx>;
  use(plugin: Plugin<Ctx>): Bot<B, C, E, Ctx>;
  initSessionStore(): Promise<void>;
  createRequestHandler(): RequestHandler<B>;
}

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
