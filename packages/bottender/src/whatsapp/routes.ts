import { Action } from '../types';
import { RoutePredicate, route } from '../router';

import WhatsappContext from './WhatsappContext';

type Route = <C extends WhatsappContext>(
  action: Action<C>
) => {
  predicate: RoutePredicate<C>;
  action: Action<C>;
};

type Whatsapp = Route & {
  any: Route;
  message: Route;
  media: Route;
  received: Route;
  sent: Route;
  delivered: Route;
  read: Route;
};

const whatsapp: Whatsapp = <C extends WhatsappContext>(action: Action<C>) => {
  return route((context: C) => context.platform === 'whatsapp', action);
};

whatsapp.any = whatsapp;

function message<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'whatsapp' && context.event.isMessage,
    action
  );
}

whatsapp.message = message;

function media<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'whatsapp' && context.event.isMedia,
    action
  );
}

whatsapp.media = media;

function received<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'whatsapp' && context.event.isReceived,
    action
  );
}

whatsapp.received = received;

function sent<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'whatsapp' && context.event.isSent,
    action
  );
}

whatsapp.sent = sent;

function delivered<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'whatsapp' && context.event.isDelivered,
    action
  );
}

whatsapp.delivered = delivered;

function read<C extends WhatsappContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'whatsapp' && context.event.isRead,
    action
  );
}

whatsapp.read = read;

export default whatsapp;
