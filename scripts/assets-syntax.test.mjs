import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { Script } from 'node:vm';

test('all shipped JavaScript assets parse successfully', () => {
  const directory = new URL('../dist/assets/js/', import.meta.url);
  const files = readdirSync(directory).filter(name => name.endsWith('.js'));
  assert.ok(files.length > 0, 'Build the website before checking its published scripts');
  for (const name of files) {
    assert.doesNotThrow(() => new Script(readFileSync(new URL(name, directory), 'utf8'), { filename: name }), name);
  }
});
