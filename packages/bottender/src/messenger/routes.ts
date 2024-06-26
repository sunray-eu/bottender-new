import { Action } from '../types';
import { RoutePredicate, route } from '../router';

import MessengerContextOrig from './MessengerContext';

type MessengerContext = MessengerContextOrig;

type Route = <C extends MessengerContext>(
  action: Action<C>
) => {
  predicate: RoutePredicate<C>;
  action: Action<C>;
};

type Messenger = Route & {
  any: Route;
  message: Route;
  accountLinking: Route & {
    linked: Route;
    unlinked: Route;
  };
  checkoutUpdate: Route;
  delivery: Route;
  echo: Route;
  gamePlay: Route;
  passThreadControl: Route;
  takeThreadControl: Route;
  requestThreadControl: Route;
  appRoles: Route;
  optin: Route;
  payment: Route;
  policyEnforcement: Route;
  postback: Route;
  preCheckout: Route;
  read: Route;
  referral: Route;
  standby: Route;
  reaction: Route & {
    react: Route;
    unreact: Route;
  };
};

const messenger: Messenger = <C extends MessengerContext>(
  action: Action<C>
) => {
  return route((context: C) => context.platform === 'messenger', action);
};

messenger.any = messenger;

function message<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isMessage,
    action
  );
}

messenger.message = message;

function accountLinking<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isAccountLinking,
    action
  );
}

messenger.accountLinking = accountLinking;

function accountLinkingLinked<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      (context.platform === 'messenger' &&
        context.event.isAccountLinking &&
        context.event.accountLinking &&
        context.event.accountLinking.status === 'linked') ||
      false,
    action
  );
}

accountLinking.linked = accountLinkingLinked;

function accountLinkingUnlinked<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      (context.platform === 'messenger' &&
        context.event.isAccountLinking &&
        context.event.accountLinking &&
        context.event.accountLinking.status === 'unlinked') ||
      false,
    action
  );
}

accountLinking.unlinked = accountLinkingUnlinked;

function checkoutUpdate<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isCheckoutUpdate,
    action
  );
}

messenger.checkoutUpdate = checkoutUpdate;

function delivery<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isDelivery,
    action
  );
}

messenger.delivery = delivery;

function echo<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isEcho,
    action
  );
}

messenger.echo = echo;

function gamePlay<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isGamePlay,
    action
  );
}

messenger.gamePlay = gamePlay;

function passThreadControl<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isPassThreadControl,
    action
  );
}

messenger.passThreadControl = passThreadControl;

function takeThreadControl<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isTakeThreadControl,
    action
  );
}

messenger.takeThreadControl = takeThreadControl;

function requestThreadControl<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isRequestThreadControl,
    action
  );
}

messenger.requestThreadControl = requestThreadControl;

function appRoles<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isAppRoles,
    action
  );
}

messenger.appRoles = appRoles;

function optin<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isOptin,
    action
  );
}

messenger.optin = optin;

function payment<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isPayment,
    action
  );
}

messenger.payment = payment;

function policyEnforcement<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isPolicyEnforcement,
    action
  );
}

messenger.policyEnforcement = policyEnforcement;

function postback<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isPostback,
    action
  );
}

messenger.postback = postback;

function preCheckout<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isPreCheckout,
    action
  );
}

messenger.preCheckout = preCheckout;

function read<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isRead,
    action
  );
}

messenger.read = read;

function referral<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isReferral,
    action
  );
}

messenger.referral = referral;

function standby<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) => context.platform === 'messenger' && context.event.isStandby,
    action
  );
}

messenger.standby = standby;

function reaction<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' && context.event.isReaction,
    action
  );
}

messenger.reaction = reaction;

function reactionReact<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' &&
      context.event.isReaction &&
      context.event.reaction?.action === 'react',
    action
  );
}

reaction.react = reactionReact;

function reactionUnreact<C extends MessengerContext>(action: Action<C>) {
  return route(
    (context: C) =>
      context.platform === 'messenger' &&
      context.event.isReaction &&
      context.event.reaction?.action === 'unreact',
    action
  );
}

reaction.unreact = reactionUnreact;

export default messenger;
