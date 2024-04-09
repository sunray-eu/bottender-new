import { MessengerClient } from '@sunray-eu/messaging-api-messenger';

import getChannelConfig from '../../../../shared/getChannelConfig';
import { getPersona } from '../persona';
import * as log from '../../../../shared/log';

jest.mock('messaging-api-messenger');

jest.mock('../../../../shared/log');
jest.mock('../../../../shared/getChannelConfig');

const MOCK_FILE_WITH_PLATFORM = {
  channels: {
    messenger: {
      accessToken: '__FAKE_TOKEN__',
    },
  },
};

beforeEach(() => {
  process.exit = jest.fn();

  jest
    .mocked(getChannelConfig)
    .mockReturnValue(MOCK_FILE_WITH_PLATFORM.channels.messenger);
});

describe('resolved', () => {
  it('call getPersona', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
        '--id': '54321',
      },
    };

    jest.mocked(MessengerClient.prototype.getPersona).mockResolvedValue({
      id: 'PERSONA_ID',
      name: 'PERSONA_NAME',
      profilePictureUrl: 'PERSONA_PROFILE_PICTURE_URL',
    });

    await getPersona(ctx);

    const client = jest.mocked(MessengerClient).mock.instances[0];

    expect(MessengerClient).toBeCalledWith({
      accessToken: '__FAKE_TOKEN__',
    });
    expect(client.getPersona).toBeCalledWith('54321');
  });

  it('error when no config setting', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
        '--id': '54321',
      },
    };

    jest.mocked(MessengerClient.prototype.getPersona).mockResolvedValue(null);

    await getPersona(ctx);

    expect(log.error).toBeCalled();
  });

  it('error when no persona id', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
      },
    };

    jest.mocked(MessengerClient.prototype.getPersona).mockResolvedValue(null);

    await getPersona(ctx);

    expect(log.error).toBeCalled();
  });
});

describe('reject', () => {
  it('handle error thrown with only status', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
        '--id': '54321',
      },
    };
    const error = {
      response: {
        status: 400,
      },
    };
    jest.mocked(MessengerClient.prototype.getPersona).mockRejectedValue(error);

    await getPersona(ctx);

    expect(log.error).toBeCalled();
    expect(process.exit).toBeCalled();
  });

  it('handle error thrown by messenger', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
        '--id': '54321',
      },
    };
    const error = {
      response: {
        status: 400,
        data: {
          error: {
            message: '(#100) ...',
            type: 'OAuthException',
            code: 100,
            error_subcode: 2018145,
            fbtrace_id: 'HXd3kIOXLsK',
          },
        },
      },
    };
    jest.mocked(MessengerClient.prototype.getPersona).mockRejectedValue(error);

    await getPersona(ctx);

    expect(log.error).toBeCalled();
    expect(jest.mocked(log.error).mock.calls[2][0]).not.toMatch(
      /\[object Object\]/
    );
    expect(process.exit).toBeCalled();
  });

  it('handle error thrown by ourselves', async () => {
    const ctx = {
      config: null,
      argv: {
        _: [],
        '--id': '54321',
      },
    };
    jest
      .mocked(MessengerClient.prototype.getPersona)
      .mockRejectedValue(new Error('something wrong happened'));

    await getPersona(ctx);

    expect(log.error).toBeCalled();
    expect(process.exit).toBeCalled();
  });
});
