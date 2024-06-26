import util from 'util';

jest.mock('delay');

let ConsoleContext;
let ConsoleEvent;
let sleep;

beforeEach(() => {
  /* eslint-disable global-require */
  ConsoleContext = await import('../ConsoleContext').default;
  ConsoleEvent = await import('../ConsoleEvent').default;
  sleep = await import('delay');
  /* eslint-enable global-require */
});

const rawEvent = {
  message: {
    text: 'Hello, world',
  },
};

const userSession = {
  user: {
    id: '1',
    name: 'you',
  },
};

const setup = (
  { session, fallbackMethods, mockPlatform } = { session: userSession }
) => {
  const client = {
    sendText: jest.fn(),
  };
  const context = new ConsoleContext({
    client,
    event: new ConsoleEvent(rawEvent),
    session,
    fallbackMethods: fallbackMethods || false,
    mockPlatform,
  });
  return {
    client,
    context,
    session,
  };
};

it('be defined', () => {
  const { context } = setup();
  expect(context).toBeDefined();
});

it('#platform to be `console` by default', () => {
  const { context } = setup();
  expect(context.platform).toBe('console');
});

it('#platform to be `console` by mockPlatform', () => {
  const { context } = setup({ mockPlatform: 'messenger' });
  expect(context.platform).toBe('messenger');
});

it('get #session works', () => {
  const { context, session } = setup();
  expect(context.session).toBe(session);
});

it('get #event works', () => {
  const { context } = setup();
  expect(context.event).toBeInstanceOf(ConsoleEvent);
});

it('get #client works', () => {
  const { context, client } = setup();
  expect(context.client).toBe(client);
});

describe('#sendText', () => {
  it('should write text to stdout', async () => {
    const { context, client } = setup();

    await context.sendText('hello');

    expect(client.sendText).toBeCalledWith('hello');
  });

  it('should support fallbackMethods with other args', async () => {
    const { context, client } = setup({ fallbackMethods: true });

    await context.sendText('hello', { other: 1 });

    expect(client.sendText).toBeCalledWith(
      `hello\nwith other args:\n${JSON.stringify([{ other: 1 }], null, 2)}`
    );
  });

  it('should not print empty array other args', async () => {
    const { context, client } = setup({ fallbackMethods: true });

    await context.sendText('hello');

    expect(client.sendText).not.toBeCalledWith(
      `hello\nwith other args:\n${JSON.stringify([], null, 2)}`
    );
    expect(client.sendText).toBeCalledWith('hello');
  });
});

describe('method missing', () => {
  it('should write text to stdout', async () => {
    const { context, client } = setup({ fallbackMethods: true });

    await context.sendABC('hello', { json: true });

    expect(client.sendText).toBeCalledWith(
      `sendABC with args:\n${JSON.stringify(
        ['hello', { json: true }],
        null,
        2
      )}`
    );
  });

  it('should not proxy blacklisted methods', async () => {
    const { context } = setup({ fallbackMethods: true });

    expect(context.then).toBeUndefined();
    expect(context.inspect).toBeUndefined();
  });

  it('should not proxy symbol', async () => {
    const { context } = setup({ fallbackMethods: true });

    expect(context[util.inspect.custom]).toBeUndefined();
  });

  it('should not proxy falsy getters', async () => {
    const { context } = setup({ fallbackMethods: true });

    expect(context.isSessionWritten).toBe(false);
  });
});
