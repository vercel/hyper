import {dirname, resolve} from 'path';

import {builders, namedTypes} from 'ast-types';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import {copy, copySync, existsSync, readFileSync, writeFileSync} from 'fs-extra';
import merge from 'lodash/merge';
import {parse, prettyPrint} from 'recast';
import * as babelParser from 'recast/parsers/babel';

import notify from '../notify';

import {_extractDefault} from './init';
import {cfgDir, cfgPath, defaultCfg, legacyCfgPath, plugs, schemaFile, schemaPath} from './paths';

// function to remove all json serializable entries from an array expression
function removeElements(node: namedTypes.ArrayExpression): namedTypes.ArrayExpression {
  const newElements = node.elements.filter((element) => {
    if (namedTypes.ObjectExpression.check(element)) {
      const newElement = removeProperties(element);
      if (newElement.properties.length === 0) {
        return false;
      }
    } else if (namedTypes.ArrayExpression.check(element)) {
      const newElement = removeElements(element);
      if (newElement.elements.length === 0) {
        return false;
      }
    } else if (namedTypes.Literal.check(element)) {
      return false;
    }
    return true;
  });
  return {...node, elements: newElements};
}

// function to remove all json serializable properties from an object expression
function removeProperties(node: namedTypes.ObjectExpression): namedTypes.ObjectExpression {
  const newProperties = node.properties.filter((property) => {
    if (
      namedTypes.ObjectProperty.check(property) &&
      (namedTypes.Literal.check(property.key) || namedTypes.Identifier.check(property.key)) &&
      !property.computed
    ) {
      if (namedTypes.ObjectExpression.check(property.value)) {
        const newValue = removeProperties(property.value);
        if (newValue.properties.length === 0) {
          return false;
        }
      } else if (namedTypes.ArrayExpression.check(property.value)) {
        const newValue = removeElements(property.value);
        if (newValue.elements.length === 0) {
          return false;
        }
      } else if (namedTypes.Literal.check(property.value)) {
        return false;
      }
    }
    return true;
  });
  return {...node, properties: newProperties};
}

export function configToPlugin(code: string): string {
  const ast: namedTypes.File = parse(code, {
    parser: babelParser
  });
  const statements = ast.program.body;
  let moduleExportsNode: namedTypes.AssignmentExpression | null = null;
  let configNode: ExpressionKind | null = null;

  for (const statement of statements) {
    if (namedTypes.ExpressionStatement.check(statement)) {
      const expression = statement.expression;
      if (
        namedTypes.AssignmentExpression.check(expression) &&
        expression.operator === '=' &&
        namedTypes.MemberExpression.check(expression.left) &&
        namedTypes.Identifier.check(expression.left.object) &&
        expression.left.object.name === 'module' &&
        namedTypes.Identifier.check(expression.left.property) &&
        expression.left.property.name === 'exports'
      ) {
        moduleExportsNode = expression;
        if (namedTypes.ObjectExpression.check(expression.right)) {
          const properties = expression.right.properties;
          for (const property of properties) {
            if (
              namedTypes.ObjectProperty.check(property) &&
              namedTypes.Identifier.check(property.key) &&
              property.key.name === 'config'
            ) {
              configNode = property.value as ExpressionKind;
              if (namedTypes.ObjectExpression.check(property.value)) {
                configNode = removeProperties(property.value);
              }
            }
          }
        } else {
          configNode = builders.memberExpression(moduleExportsNode.right, builders.identifier('config'));
        }
      }
    }
  }

  if (!moduleExportsNode) {
    console.log('No module.exports found in config');
    return '';
  }
  if (!configNode) {
    console.log('No config field found in module.exports');
    return '';
  }
  if (namedTypes.ObjectExpression.check(configNode) && configNode.properties.length === 0) {
    return '';
  }

  moduleExportsNode.right = builders.objectExpression([
    builders.property(
      'init',
      builders.identifier('decorateConfig'),
      builders.arrowFunctionExpression(
        [builders.identifier('_config')],
        builders.callExpression(
          builders.memberExpression(builders.identifier('Object'), builders.identifier('assign')),
          [builders.objectExpression([]), builders.identifier('_config'), configNode]
        )
      )
    )
  ]);

  return prettyPrint(ast, {tabWidth: 2}).code;
}

export const _write = (path: string, data: string) => {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = (str: string) => {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

// Migrate Hyper3 config to Hyper4 but only if the user hasn't manually
// touched the new config and if the old config is not a symlink
export const migrateHyper3Config = () => {
  copy(schemaPath, resolve(cfgDir, schemaFile), (err) => {
    if (err) {
      console.error(err);
    }
  });

  if (existsSync(cfgPath)) {
    return;
  }

  if (!existsSync(legacyCfgPath)) {
    copySync(defaultCfg, cfgPath);
    return;
  }

  // Migrate
  copySync(resolve(dirname(legacyCfgPath), '.hyper_plugins', 'local'), plugs.local);

  const defaultCfgData = JSON.parse(readFileSync(defaultCfg, 'utf8'));
  let newCfgData;
  try {
    const legacyCfgRaw = readFileSync(legacyCfgPath, 'utf8');
    const legacyCfgData = _extractDefault(legacyCfgRaw);
    newCfgData = merge({}, defaultCfgData, legacyCfgData);

    const pluginCode = configToPlugin(legacyCfgRaw);
    if (pluginCode) {
      const pluginPath = resolve(plugs.local, 'migrated-hyper3-config.js');
      newCfgData.localPlugins = ['migrated-hyper3-config', ...(newCfgData.localPlugins || [])];
      _write(pluginPath, pluginCode);
    }
  } catch (e) {
    console.error(e);
    notify(
      'Hyper 4',
      `Failed to migrate your config from Hyper 3.\nDefault config will be created instead at ${cfgPath}`
    );
    newCfgData = defaultCfgData;
  }
  _write(cfgPath, JSON.stringify(newCfgData, null, 2));

  notify('Hyper 4', `Settings location and format has changed to ${cfgPath}`);
};
