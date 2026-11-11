import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/api.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  transformers: {
    before: [(context) => (root) => {
      const visit = (node) => ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword
        ? ts.factory.createIdentifier('testImportMeta')
        : ts.visitEachChild(node, visit, context);
      return ts.visitNode(root, visit);
    }],
  },
}).outputText;

function loadApi(fetch) {
  const events = [];
  const exports = {};
  runInNewContext(compiled, {
    exports,
    Headers,
    Response,
    AbortSignal,
    Event,
    fetch,
    testImportMeta: { env: {} },
    window: { dispatchEvent: (event) => events.push(event.type) },
  });
  return { api: exports.api, events };
}

test('preserva a sessão quando o servidor falha ao renovar e permite tentar novamente', async () => {
  let renewals = 0;
  let renewed = false;
  const { api, events } = loadApi(async (url) => {
    if (url.endsWith('/refresh-token')) {
      renewals++;
      if (renewals === 1) return Response.json({ error: 'Serviço indisponível' }, { status: 503 });
      renewed = true;
      return Response.json({});
    }
    return Response.json(renewed ? [] : {}, { status: renewed ? 200 : 401 });
  });

  await assert.rejects(api.getTeacherActivities(), /Serviço indisponível/);
  assert.deepEqual(events, []);
  assert.equal((await api.getTeacherActivities()).length, 0);
  assert.equal(renewals, 2);
});

test('preserva a sessão se a conexão cair durante a renovação', async () => {
  const { api, events } = loadApi(async (url) => {
    if (url.endsWith('/refresh-token')) throw new TypeError('Failed to fetch');
    return Response.json({}, { status: 401 });
  });

  await assert.rejects(api.getTeacherActivities(), /Failed to fetch/);
  assert.deepEqual(events, []);
});

test('encerra a sessão quando o backend recusa o refresh por expiração', async () => {
  const { api, events } = loadApi(async () =>
    Response.json({ error: 'Sessão expirada' }, { status: 401 }));

  await assert.rejects(api.getTeacherActivities(), /Sessão expirada/);
  assert.deepEqual(events, ['aurora:session-expired']);
});

test('compartilha uma única renovação entre consultas simultâneas', async () => {
  let renewed = false;
  let renewals = 0;
  const { api, events } = loadApi(async (url) => {
    if (url.endsWith('/refresh-token')) {
      renewals++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      renewed = true;
      return Response.json({});
    }
    return Response.json(renewed ? [] : {}, { status: renewed ? 200 : 401 });
  });

  await Promise.all([api.getTeacherActivities(), api.getStudentActivities()]);
  assert.equal(renewals, 1);
  assert.deepEqual(events, []);
});
