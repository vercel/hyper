#!/usr/bin/env zx

$.prefix = 'set -e;';

await $`tsc -b app/tsconfig.json`.pipe(process.stdout);

import { cpSync } from 'fs';
import { basename } from 'path';

await $`mkdir -p dist/tmp/root/app`;

await cpSync(
	'target',
	'dist/tmp/root/app',
	{
		recursive: true,
		filter: function (s) {
			const b = basename(s);
			if (b === 'node_modules' || b === 'renderer') {
				return false;
			}
			return true;
		}
	}
)

await $`cross-env DEBUG=ava:watcher AVA_IMPORT_FROM_PROJECT_NO_STUB=1 ava --no-cache`.pipe(process.stdout);