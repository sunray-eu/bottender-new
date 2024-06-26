import { ViberClient } from '@sunray-eu/messaging-api-viber';

import ViberConnector from '../ViberConnector';
import ViberContext from '../ViberContext';
import ViberEvent from '../ViberEvent';
import { ViberRequestBody } from '../ViberTypes';

jest.mock('messaging-api-viber');

const ACCESS_TOKEN = 'ACCESS_TOKEN';

const subscribedRequest: ViberRequestBody = {
  event: 'subscribed',
  timestamp: 1457764197627,
  user: {
    id: '01234567890A=',
    name: 'John McClane',
    avatar: 'http://avatar.example.com',
    country: 'UK',
    language: 'en',
    apiVersion: 1,
  },
  messageToken: 4912661846655238145n,
};

const unsubscribedRequest: ViberRequestBody = {
  event: 'unsubscribed',
  timestamp: 1457764197627,
  userId: '01234567890A=',
  messageToken: 4912661846655238145n,
};

const conversationStartedRequest: ViberRequestBody = {
  event: 'conversation_started',
  timestamp: 1457764197627,
  messageToken: 4912661846655238145n,
  type: 'open',
  context: 'context information',
  user: {
    id: '01234567890A=',
    name: 'John McClane',
    avatar: 'http://avatar.example.com',
    country: 'UK',
    language: 'en',
    apiVersion: 1,
  },
  subscribed: false,
};

const deliveredRequest: ViberRequestBody = {
  event: 'delivered',
  timestamp: 1457764197627,
  messageToken: 4912661846655238145n,
  userId: '01234567890A=',
};

const seenRequest: ViberRequestBody = {
  event: 'seen',
  timestamp: 1457764197627,
  messageToken: 4912661846655238145n,
  userId: '01234567890A=',
};

const failedRequest: ViberRequestBody = {
  event: 'failed',
  timestamp: 1457764197627,
  messageToken: 4912661846655238145n,
  userId: '01234567890A=',
  desc: 'failure description',
};

const messageRequest: ViberRequestBody = {
  event: 'message',
  timestamp: 1457764197627,
  messageToken: 4912661846655238145n,
  sender: {
    id: '01234567890A=',
    name: 'John McClane',
    avatar: 'http://avatar.example.com',
    country: 'UK',
    language: 'en',
    apiVersion: 1,
  },
  message: {
    type: 'text',
    text: 'a message to the service',
    trackingData: 'tracking data',
  },
};

function setup() {
  const connector = new ViberConnector({
    accessToken: ACCESS_TOKEN,
    sender: { name: 'sender' },
    skipLegacyProfile: false,
  });

  const client = jest.mocked(ViberClient).mock.instances[0];

  return {
    connector,
    client,
  };
}

describe('#platform', () => {
  it('should be viber', () => {
    const { connector } = setup();

    expect(connector.platform).toBe('viber');
  });
});

describe('#client', () => {
  it('should be client', () => {
    const { connector, client } = setup();

    expect(connector.client).toBe(client);
  });

  it('support custom client', () => {
    const client = new ViberClient({
      accessToken: ACCESS_TOKEN,
      sender: { name: 'sender' },
    });
    const connector = new ViberConnector({ client });

    expect(connector.client).toBe(client);
  });
});

describe('#getUniqueSessionKey', () => {
  it('extract correct user id from subscribedRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(subscribedRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from unsubscribedRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(unsubscribedRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from conversationStartedRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(conversationStartedRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from deliveredRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(deliveredRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from seenRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(seenRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from failedRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(failedRequest);

    expect(senderId).toBe('01234567890A=');
  });

  it('extract correct user id from messageRequest', () => {
    const { connector } = setup();

    const senderId = connector.getUniqueSessionKey(messageRequest);

    expect(senderId).toBe('01234567890A=');
  });
});

describe('#updateSession', () => {
  it('update session with data needed from subscribedRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
      name: 'John McClane',
      avatar: 'http://avatar.example.com',
      country: 'UK',
      language: 'en',
      apiVersion: 1,
    };

    const session = {};

    await connector.updateSession(session, subscribedRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from unsubscribedRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
    };

    const session = {};

    await connector.updateSession(session, unsubscribedRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from conversationStartedRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
      name: 'John McClane',
      avatar: 'http://avatar.example.com',
      country: 'UK',
      language: 'en',
      apiVersion: 1,
    };

    const session = {};

    await connector.updateSession(session, conversationStartedRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from deliveredRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
    };

    const session = {};

    await connector.updateSession(session, deliveredRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from seenRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
    };

    const session = {};

    await connector.updateSession(session, seenRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from failedRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
    };

    const session = {};

    await connector.updateSession(session, failedRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session with data needed from messageRequest', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
      name: 'John McClane',
      avatar: 'http://avatar.example.com',
      country: 'UK',
      language: 'en',
      apiVersion: 1,
    };

    const session = {};

    await connector.updateSession(session, messageRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });

  it('update session from id-only user', async () => {
    const { connector } = setup();

    const user = {
      id: '01234567890A=',
      name: 'John McClane',
      avatar: 'http://avatar.example.com',
      country: 'UK',
      language: 'en',
      apiVersion: 1,
    };

    const session = {
      user: {
        id: '01234567890A=',
        _updatedAt: new Date().toISOString(),
      },
    };

    await connector.updateSession(session, messageRequest);

    expect(session).toEqual({
      user: {
        _updatedAt: expect.any(String),
        ...user,
      },
    });
  });
});

describe('#mapRequestToEvents', () => {
  it('should map request to ViberEvents', () => {
    const { connector } = setup();

    const events = connector.mapRequestToEvents(messageRequest);

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ViberEvent);
  });
});

describe('#createContext', () => {
  it('should create ViberContext', () => {
    const { connector } = setup();

    const event = new ViberEvent(deliveredRequest);
    const session = {};

    const context = connector.createContext({
      event,
      session,
    });

    expect(context).toBeDefined();
    expect(context).toBeInstanceOf(ViberContext);
  });
});

describe('#verifySignature', () => {
  it('should return true if signature is equal app secret after crypto', () => {
    const { connector } = setup();

    const result = connector.verifySignature(
      'rawBody',
      '250a5136d2f241195d4cb981a7293958434ec3ba9e50ed20788e9b030a1dd878='
    );

    expect(result).toBe(true);
  });
});

describe('#preprocess', () => {
  it('should return shouldNext: true if request method is get', () => {
    const { connector } = setup();

    expect(
      connector.preprocess({
        method: 'get',
        headers: {
          'x-viber-content-signature': 'abc',
        },
        query: {},
        rawBody: JSON.stringify(subscribedRequest),
        body: subscribedRequest,
        path: '/webhooks/viber',
        params: {},
        url: 'https://www.example.com/webhooks/viber',
      })
    ).toEqual({
      shouldNext: true,
    });
  });

  it('should return shouldNext: true if signature match', () => {
    const { connector } = setup();

    expect(
      connector.preprocess({
        method: 'post',
        headers: {
          'x-viber-content-signature':
            'a4b6913412505d2c6031e7ec75e75c51bdc2fe30dc367301528a28b2008300a4',
        },
        query: {},
        rawBody: JSON.stringify(subscribedRequest),
        body: subscribedRequest,
        path: '/webhooks/viber',
        params: {},
        url: 'https://www.example.com/webhooks/viber',
      })
    ).toEqual({
      shouldNext: true,
    });
  });

  it('should return shouldNext: false and error if signature does not match', () => {
    const { connector } = setup();

    expect(
      connector.preprocess({
        method: 'post',
        headers: {
          'x-viber-content-signature':
            '250a5136d2f241195d4cb981a7293958434ec3ba9e50ed20788e9b030a1dd878',
        },
        query: {},
        rawBody: JSON.stringify(subscribedRequest),
        body: subscribedRequest,
        path: '/webhooks/viber',
        params: {},
        url: 'https://www.example.com/webhooks/viber',
      })
    ).toEqual({
      shouldNext: false,
      response: {
        status: 400,
        body: {
          error: {
            message: 'Viber Signature Validation Failed!',
            request: {
              headers: {
                'x-viber-content-signature':
                  '250a5136d2f241195d4cb981a7293958434ec3ba9e50ed20788e9b030a1dd878',
              },
              rawBody: JSON.stringify(subscribedRequest),
            },
          },
        },
      },
    });
  });
});
