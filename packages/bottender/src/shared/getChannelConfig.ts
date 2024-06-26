import invariant from 'invariant';
import { get } from 'lodash-es';

import { Channel } from '../types';

import getBottenderConfig from './getBottenderConfig';
import getChannelSchema from './getChannelSchema';
import { bold } from './log';

async function getChannelConfig({
  channel,
}: {
  channel: Channel;
}): Promise<Record<string, unknown>> {
  const config = await getBottenderConfig();

  const channelConfig = get(config, `channels.${channel}`);

  invariant(
    channelConfig,
    `Could not find \`channels.${channel}\` key in your \`bottender.config.js\`, please check your config file is in the correct format.`
  );

  const schema = getChannelSchema(channel);

  const validateResult = schema.validate(channelConfig, {
    allowUnknown: true,
  });

  if (validateResult.error) {
    const { message, type } = validateResult.error.details[0];
    const errorPath = `channels.${channel}.${validateResult.error.details[0].path.join(
      '.'
    )}`;
    throw new Error(
      `The config format is not valid.\nmessage: ${message}\npath: ${bold(
        errorPath
      )}\ntype: ${type}`
    );
  }

  return channelConfig;
}

export default getChannelConfig;
