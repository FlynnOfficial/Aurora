// gerar-hashes.js (execute uma única vez)
const bcrypt = require('bcryptjs');

async function gerarHashes() {
  const senha = '123456';
  const hash = await bcrypt.hash(senha, 10);
  console.log('Hash para "123456":', hash);
}

gerarHashes();