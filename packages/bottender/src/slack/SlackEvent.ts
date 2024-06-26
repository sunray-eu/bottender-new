import { pascalCase } from 'change-case';

import { Event } from '../context/Event';

import {
  CommandEvent,
  InteractiveMessageEvent,
  Message,
  SlackRawEvent,
} from './SlackTypes';

export default class SlackEvent implements Event<SlackRawEvent> {
  _rawEvent: SlackRawEvent;

  _timestamp: number;

  constructor(rawEvent: SlackRawEvent) {
    this._rawEvent = rawEvent;
    this._timestamp = Date.now();
  }

  /**
   * Underlying raw event from Slack.
   *
   */
  get rawEvent(): SlackRawEvent {
    return this._rawEvent;
  }

  /**
   * The timestamp when the event was sent
   *
   */
  get timestamp(): number | undefined {
    let timestamp: number | undefined;
    if ('eventTs' in this._rawEvent && this._rawEvent.eventTs !== undefined) {
      timestamp = Math.round(parseFloat(this._rawEvent.eventTs) * 1000);
    } else if ('ts' in this._rawEvent) {
      timestamp = Math.round(parseFloat(this._rawEvent.ts) * 1000);
    } else {
      timestamp = Math.round(this._timestamp);
    }
    return timestamp;
  }

  /**
   * Determine if the event is a message event.
   *
   */
  get isMessage(): boolean {
    return this._rawEvent.type === 'message';
  }

  /**
   * Determine if the event is a message event sent from channels.
   *
   */
  get isChannelsMessage(): boolean {
    if (!this.isMessage || !this.message) return false;

    const message = this.message;

    return message.channel.startsWith('C');
  }

  /**
   * Determine if the event is a message event sent from groups.
   *
   */
  get isGroupsMessage(): boolean {
    if (!this.isMessage || !this.message) return false;

    const message = this.message;

    return message.channel.startsWith('G');
  }

  /**
   * Determine if the event is a message event sent from instant messaging.
   *
   */
  get isImMessage(): boolean {
    if (!this.isMessage || !this.message) return false;

    const message = this.message;

    return message.channel.startsWith('D');
  }

  /**
   * Determine if the event is a message event sent from multiple people instant messaging.
   *
   */
  get isMpimMessage(): boolean {
    if (!this.isMessage || !this.message) return false;

    const message = this.message;

    return message.channel.startsWith('G');
  }

  /**
   * The message object from Slack raw event.
   *
   */
  get message(): Message | null {
    if (!this.isMessage) return null;

    const message = this._rawEvent as Message;

    return message;
  }

  /**
   * Determine if the event is a message event which includes text.
   *
   */
  get isText(): boolean {
    return this.isMessage;
  }

  /**
   * The text string from Slack raw event.
   *
   */
  get text(): string | null {
    if (this.isText) {
      return (this._rawEvent as Message).text;
    }
    if (this.isCommand) {
      return (this._rawEvent as CommandEvent).text;
    }

    return null;
  }

  /**
   * Determine if the event is a interactive message (button/menu) event.
   *
   */
  get isInteractiveMessage(): boolean {
    return this._rawEvent.type === 'interactive_message';
  }

  /**
   * Determine if the event is a block actions (button/menu) event.
   *
   */
  get isBlockAction(): boolean {
    return this._rawEvent.type === 'block_actions';
  }

  /**
   * Determine if the event is a view submission event.
   *
   */
  get isViewSubmission(): boolean {
    return this._rawEvent.type === 'view_submission';
  }

  /**
   * Determine if the event is a view closed event.
   *
   */
  get isViewClosed(): boolean {
    return this._rawEvent.type === 'view_closed';
  }

  /**
   * Determine if the event is an UI Event (block actions or interactive message)
   *
   */
  get isBlockActionOrInteractiveMessage(): boolean {
    return this.isBlockAction || this.isInteractiveMessage;
  }

  /**
   * The callback_id from Slack interactive message.
   *
   */
  get callbackId(): string | null {
    if (this.isBlockActionOrInteractiveMessage) {
      return (this._rawEvent as InteractiveMessageEvent).callbackId;
    }
    return null;
  }

  /**
   * The action from Slack interactive message.
   *
   */
  get action(): object | null {
    if (this.isBlockActionOrInteractiveMessage) {
      return (this._rawEvent as InteractiveMessageEvent).actions[0];
    }
    return null;
  }

  /**
   * Determine if the event is a bot message event.
   *
   */
  get isBotMessage(): boolean {
    return (this._rawEvent as any).subtype === 'bot_message';
  }

  /**
   * Determine if the event is a slash command event.
   *
   */
  get isCommand(): boolean {
    return !!(this._rawEvent as CommandEvent).command;
  }

  /**
   * The slash command name.
   *
   */
  get command(): string | null {
    return (this._rawEvent as CommandEvent).command || null;
  }
}

// https://api.slack.com/events
const Events = [
  'app_uninstalled',
  'channel_archive',
  'channel_created',
  'channel_deleted',
  'channel_history_changed',
  'channel_rename',
  'channel_unarchive',
  'dnd_updated',
  'dnd_updated_user',
  'email_domain_changed',
  'emoji_changed',
  'file_change',
  'file_comment_added',
  'file_comment_deleted',
  'file_comment_edited',
  'file_created',
  'file_deleted',
  'file_public',
  'file_shared',
  'file_unshared',
  'grid_migration_finished',
  'grid_migration_started',
  'group_archive',
  'group_close',
  'group_history_changed',
  'group_open',
  'group_rename',
  'group_unarchive',
  'im_close',
  'im_created',
  'im_history_changed',
  'im_open',
  'link_shared',
  'member_joined_channel',
  'member_left_channel',
  'pin_added',
  'pin_removed',
  'reaction_added',
  'reaction_removed',
  'star_added',
  'star_removed',
  'subteam_created',
  'subteam_members_changed',
  'subteam_self_added',
  'subteam_self_removed',
  'subteam_updated',
  'team_domain_change',
  'team_join',
  'team_rename',
  'tokens_revoked',
  'url_verification',
  'user_change',
];

Events.forEach((event) => {
  Object.defineProperty(SlackEvent.prototype, `is${pascalCase(event)}`, {
    enumerable: false,
    configurable: true,
    get() {
      return this._rawEvent.type === event;
    },
  });
});
