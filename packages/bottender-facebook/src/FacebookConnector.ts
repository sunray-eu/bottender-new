import { EventEmitter } from 'events';
import storage from 'node-persist';

import warning from 'warning';
import { BatchConfig } from 'facebook-batch';
import {
  Connector,
  FacebookBaseConnector,
  MessengerConnector,
  MessengerContext,
  MessengerEvent,
  MessengerTypes,
  RequestContext,
} from 'bottender';
import { JsonObject } from 'type-fest';

import FacebookClient from './FacebookClient';
import FacebookContext from './FacebookContext';
import FacebookEvent from './FacebookEvent';
import { ChangesEntry, FacebookWebhookRequestBody } from './FacebookTypes';

// TODO: use exported type
type Session = Record<string, unknown>;

interface CommentLevelData {
  parentId?: string;
  level: number;
  sessionId?: string;
  fromId?: string;
}

export type FacebookConnectorOptions = {
  appId: string;
  appSecret: string;
  accessToken?: string;
  client?: FacebookClient;
  mapPageToAccessToken?: (pageId: string) => Promise<string>;
  verifyToken?: string;
  batchConfig?: BatchConfig;
  origin?: string;
  skipAppSecretProof?: boolean;
  skipProfile?: boolean;
};

export default class FacebookConnector
  extends FacebookBaseConnector<FacebookWebhookRequestBody, FacebookClient>
  implements Connector<FacebookWebhookRequestBody, FacebookClient>
{
  _mapPageToAccessToken: ((pageId: string) => Promise<string>) | null = null;

  _messengerConnector: MessengerConnector;

  // const CommentLevels = new Map<
  //   string,
  //   { parentId?: string; level: number; sessionId?: string }
  // >();

  _commentsLevelsStorage = storage.create({
    dir: '.fbcommentshierarchydata',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false, // can also be custom logging function
    ttl: 60 * 24 * 2 * 60 * 1000, // ttl in milliseconds
    expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
    forgiveParseErrors: false,
  });

  public constructor(options: FacebookConnectorOptions) {
    super({
      ...options,
      ClientClass: FacebookClient,
    });

    const { mapPageToAccessToken } = options;

    this._mapPageToAccessToken = mapPageToAccessToken ?? null;
    this._messengerConnector = new MessengerConnector({
      ...options,
      ClientClass: FacebookClient,
      mapPageToAccessToken,
    });

    this._commentsLevelsStorage.init();
  }

  async getCommentLevelData(
    event: FacebookEvent
  ): Promise<CommentLevelData | undefined> {
    if (!event.isComment || !event.comment) {
      return undefined;
    }
    const comment = event.comment;
    const commentId = comment.commentId;
    const readData: CommentLevelData | null =
      await this._commentsLevelsStorage.get(commentId);

    if (readData) {
      return readData;
    }

    let newCommentData: CommentLevelData;
    if (event.isFirstLayerComment) {
      newCommentData = {
        level: 1,
        sessionId: comment.commentId,
      };
      await this._commentsLevelsStorage.setItem(commentId, newCommentData);
      return newCommentData;
    }
    let actualComment: CommentLevelData = {
      level: 3,
      parentId: comment.parentId,
      fromId: comment.from.id,
    };
    console.log('Actual comment:', actualComment);

    const commentsPath: (CommentLevelData & { commentId: string })[] = [
      { ...actualComment, commentId: comment.commentId },
    ];
    while (true) {
      let parentComment: CommentLevelData | null =
        // eslint-disable-next-line no-await-in-loop
        await this._commentsLevelsStorage.get(actualComment.parentId as string);

      if (parentComment) {
        if (parentComment.level === 1) {
          // if (
          //   commentsPath[commentsPath.length - 1].fromId !==
          //   // eslint-disable-next-line no-await-in-loop
          //   (await this.client.getPageInfo()).id
          // ) {
          //   return undefined;
          // }
          commentsPath[commentsPath.length - 1].level = 2;
          const newSessionId = parentComment.sessionId;

          commentsPath.forEach((val) => {
            val.sessionId = newSessionId;
          });
        }

        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          commentsPath.map(async (val) => {
            await this._commentsLevelsStorage.setItem(
              val.commentId,
              val as CommentLevelData
            );
          })
        );
        return commentsPath[commentsPath.length - 1];
      }

      // eslint-disable-next-line no-await-in-loop
      const apiComment = await this.client.getComment(
        actualComment.parentId as string,
        {
          fields: ['parent'],
        }
      );

      const isRoot = apiComment.parent.id === actualComment.parentId;

      if (isRoot) {
        // if (
        //   commentsPath[commentsPath.length - 1].fromId !==
        //   // eslint-disable-next-line no-await-in-loop
        //   (await this.client.getPageInfo()).id
        // ) {
        //   return undefined;
        // }
        parentComment = {
          level: 1,
        };
        commentsPath[commentsPath.length - 1].level = 2;
        commentsPath.push({
          ...parentComment,
          commentId: actualComment.parentId as string,
        });

        const newSessionId = `${actualComment.parentId}`;

        commentsPath.forEach((val) => {
          val.sessionId = newSessionId;
        });

        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          commentsPath.map(async (val) => {
            await this._commentsLevelsStorage.setItem(
              val.commentId,
              val as CommentLevelData
            );
          })
        );
        return commentsPath[commentsPath.length - 1];
      }
      parentComment = {
        level: 3,
        parentId: apiComment.parent.id,
      };
      commentsPath.push({
        ...parentComment,
        commentId: actualComment.parentId as string,
      });
      actualComment = parentComment;
    }
  }

  /**
   * The name of the platform.
   *
   */
  get platform(): 'facebook' {
    return 'facebook';
  }

  async getUniqueSessionKey(
    event: FacebookEvent | MessengerEvent
  ): Promise<string | null> {
    if (event instanceof MessengerEvent) {
      return this._messengerConnector.getUniqueSessionKey(event);
    }

    if (event.isCommentAdd) {
      const commentLevelData = await this.getCommentLevelData(event);
      if (commentLevelData && commentLevelData.level !== 3) {
        return commentLevelData.sessionId || null;
      }
    }

    // TODO: How to determine session key in facebook feed events
    return null;
  }

  public async updateSession(
    session: Session,
    event: FacebookEvent | MessengerEvent
  ): Promise<void> {
    if (!session.user) {
      session.page = {
        id: event.pageId,
        _updatedAt: new Date().toISOString(),
      };

      session.user = {
        _updatedAt: new Date().toISOString(),
        id: this.getUniqueSessionKey(event),
      };
    }

    Object.freeze(session.user);
    Object.defineProperty(session, 'user', {
      configurable: false,
      enumerable: true,
      writable: false,
      value: session.user,
    });

    Object.freeze(session.page);
    Object.defineProperty(session, 'page', {
      configurable: false,
      enumerable: true,
      writable: false,
      value: session.page,
    });
  }

  public mapRequestToEvents(
    body: FacebookWebhookRequestBody
  ): (FacebookEvent | MessengerEvent)[] {
    // TODO: returns InstagramEvent (object === 'instagram')
    if (body.object !== 'page') {
      return [];
    }

    const bodyEntry: (MessengerTypes.MessagingEntry | ChangesEntry)[] =
      body.entry;

    return bodyEntry
      .map<FacebookEvent | MessengerEvent | null>((entry) => {
        const pageId = entry.id;
        const timestamp = entry.time;
        if ('messaging' in entry) {
          return new MessengerEvent(entry.messaging[0], {
            pageId,
            isStandby: false,
          });
        }

        if ('standby' in entry) {
          return new MessengerEvent(entry.standby[0], {
            pageId,
            isStandby: true,
          });
        }

        if ('changes' in entry) {
          return new FacebookEvent(entry.changes[0], { pageId, timestamp });
        }

        return null;
      })
      .filter(
        (event): event is FacebookEvent | MessengerEvent => event !== null
      );
  }

  public async createContext(params: {
    event: FacebookEvent | MessengerEvent;
    session?: Session;
    initialState?: JsonObject;
    requestContext?: RequestContext;
    emitter?: EventEmitter;
  }): Promise<FacebookContext | MessengerContext> {
    let customAccessToken;

    if (this._mapPageToAccessToken) {
      const { pageId } = params.event;

      if (!pageId) {
        warning(false, 'Could not find pageId from request body.');
      } else {
        customAccessToken = await this._mapPageToAccessToken(pageId);
      }
    }

    let client;
    if (customAccessToken) {
      client = new FacebookClient({
        accessToken: customAccessToken,
        appSecret: this._appSecret,
        origin: this._origin,
        skipAppSecretProof: this._skipAppSecretProof,
      });
    } else {
      client = this._client;
    }

    if (params.event instanceof FacebookEvent) {
      return new FacebookContext({
        ...params,
        event: params.event,
        client,
        customAccessToken,
        batchQueue: this._batchQueue,
        appId: this._appId,
      });
    }
    return new MessengerContext({
      ...params,
      event: params.event,
      client,
      customAccessToken,
      batchQueue: this._batchQueue,
      appId: this._appId,
    });
  }
}
