/* eslint-disable consistent-return */
import Table from 'cli-table3';
import chalk from 'chalk';
import invariant from 'invariant';
import { MessengerClient } from '@sunray-eu/messaging-api-messenger';

import getChannelConfig from '../../../shared/getChannelConfig';
import getSubArgs from '../sh/utils/getSubArgs';
import { Channel, ErrorResponse } from '../../../types';
import { CliContext } from '../..';
import { bold, error, print } from '../../../shared/log';

const help = () => {
  console.log(`
  bottender messenger persona <command> [option]

  ${chalk.dim('Commands:')}

    list              List all personas.
    create            Create a new persona with name and profile picture URL.
    get               Get persona by persona ID.
    del, delete       Delete persona by persona ID.

  ${chalk.dim('Options:')}

    --name            Specify persona's name when create
    --pic             Specify persona's profile image URL when create
    --id              Specify persona's ID to get or delete

  ${chalk.dim('Examples:')}

  ${chalk.dim('-')} Create a new persona

    ${chalk.cyan(
      '$ bottender messenger persona create --name <PERSONA_NAME> --pic <PROFILE_IMAGE_URL>'
    )}

  ${chalk.dim('-')} Get persona by ID

    ${chalk.cyan('$ bottender messenger persona get --id <PERSONA_ID>')}

  ${chalk.dim('-')} Delete persona with specific access token

    ${chalk.cyan('$ bottender messenger persona delete --id <PERSONA_ID>')}
`);
};

export async function createPersona(ctx: CliContext): Promise<void> {
  const argv = getSubArgs(ctx.argv, {
    '--name': String,
    '--pic': String,
  });

  const personaName = argv['--name'];
  const personaUrl = argv['--pic'];

  try {
    const config = await getChannelConfig({ channel: Channel.Messenger });

    const { accessToken } = config as { accessToken: string };

    invariant(
      accessToken,
      '`accessToken` is not found in the `bottender.config.js` file'
    );

    invariant(
      personaName,
      '`name` is required but not found. Use --name <name> to specify persona name'
    );
    invariant(
      personaUrl,
      '`pic` is required but not found. Use --pic <URL> to specify persona profile picture URL'
    );

    const client = new MessengerClient({
      accessToken,
    });

    const persona = {
      name: personaName as string,
      profilePictureUrl: personaUrl as string,
    };

    const personaID = await client.createPersona(persona);

    print(`Successfully create ${bold('persona')} ${bold(personaID.id)}`);
  } catch (err) {
    error(`Failed to create ${bold('persona')}`);

    const errObj = err as ErrorResponse;

    if (errObj.response) {
      error(`status: ${bold(errObj.response.status as string)}`);
      if (errObj.response.data) {
        error(`data: ${bold(JSON.stringify(errObj.response.data, null, 2))}`);
      }
    } else {
      error(errObj.message as string);
    }

    return process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function listPersona(_: CliContext): Promise<void> {
  try {
    const config = getChannelConfig({ channel: Channel.Messenger });

    const { accessToken } = (await config) as { accessToken: string };

    invariant(
      accessToken,
      '`accessToken` is not found in the `bottender.config.js` file'
    );

    const client = new MessengerClient({
      accessToken,
    });

    const personas = await client.getAllPersonas();

    if (personas.length !== 0) {
      print('Personas');
      const table = new Table({
        head: ['id', 'name', 'image URL'],
        colWidths: [30, 30, 30],
      });
      personas.forEach((item) => {
        table.push([item.id, item.name, item.profilePictureUrl]);
      });
      console.log(table.toString()); // eslint-disable-line no-console
    } else {
      print('No personas are found.');
    }
  } catch (err) {
    error(`Failed to list ${bold('personas')}`);

    const errObj = err as ErrorResponse;
    if (errObj.response) {
      error(`status: ${bold(errObj.response.status as string)}`);
      if (errObj.response.data) {
        error(`data: ${bold(JSON.stringify(errObj.response.data, null, 2))}`);
      }
    } else {
      error(errObj.message as string);
    }
    return process.exit(1);
  }
}

export async function getPersona(ctx: CliContext): Promise<void> {
  const argv = getSubArgs(ctx.argv, {
    '--id': String,
  });

  const personaId = argv['--id'];

  try {
    const config = getChannelConfig({ channel: Channel.Messenger });

    const { accessToken } = (await config) as { accessToken: string };

    invariant(
      accessToken,
      '`accessToken` is not found in the `bottender.config.js` file'
    );
    invariant(
      personaId,
      '`id` is required but not found. Use --id <id> to specify persona id'
    );

    const client = new MessengerClient({
      accessToken,
    });

    const persona = await client.getPersona(personaId as string);

    if (persona !== undefined) {
      print(`Information of persona ${bold(personaId as string)}:`);
      print(`Name: ${bold(persona.name)}`);
      print(`Profile picture: ${bold(persona.profilePictureUrl)}`);
    } else {
      print(`Cannot get persona of ID ${bold(personaId as string)}`);
    }
  } catch (err) {
    error(
      `Failed to get ${bold('persona')} of ID ${bold(personaId as string)}`
    );

    const errObj = err as ErrorResponse;

    if (errObj.response) {
      error(`status: ${bold(errObj.response.status as string)}`);
      if (errObj.response.data) {
        error(`data: ${bold(JSON.stringify(errObj.response.data, null, 2))}`);
      }
    } else {
      error(errObj.message as string);
    }

    return process.exit(1);
  }
}

export async function deletePersona(ctx: CliContext): Promise<void> {
  const argv = getSubArgs(ctx.argv, {
    '--id': String,
  });

  const personaId = argv['--id'];

  try {
    const config = getChannelConfig({ channel: Channel.Messenger });

    const { accessToken } = (await config) as { accessToken: string };

    invariant(
      accessToken,
      '`accessToken` is not found in the `bottender.config.js` file'
    );
    invariant(
      personaId,
      '`id` is required but not found. Use --id <id> to specify persona id'
    );

    const client = new MessengerClient({
      accessToken,
    });

    const res = await client.deletePersona(personaId as string);

    if (res.success === true || res.success === 'true') {
      print(`Sucessfully delete persona of ID ${bold(personaId as string)}`);
    } else {
      print(`Cannot get persona of ID ${bold(personaId as string)}`);
    }
  } catch (err) {
    error(
      `Failed to delete ${bold('persona')} of ID ${bold(personaId as string)}`
    );

    const errObj = err as ErrorResponse;

    if (errObj.response) {
      error(`status: ${bold(errObj.response.status as string)}`);
      if (errObj.response.data) {
        error(`data: ${bold(JSON.stringify(errObj.response.data, null, 2))}`);
      }
    } else {
      error(errObj.message as string);
    }

    return process.exit(1);
  }
}

export default async function main(ctx: CliContext) {
  const subcommand = ctx.argv._[2];

  switch (subcommand) {
    case 'create':
      return createPersona(ctx);
    case 'list':
      return listPersona(ctx);
    case 'get':
      return getPersona(ctx);
    case 'delete':
    case 'del':
      return deletePersona(ctx);
    default:
      error(`Please specify a valid subcommand: create, list, get, delete`);
      help();
  }
}
