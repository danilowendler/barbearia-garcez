// Define uma nova senha para o usuário admin do Supabase Auth.
// Uso:  node scripts/set-admin-password.mjs "SuaNovaSenhaForte"
// Lê as credenciais de .env.local — rodar na raiz do projeto.

import { readFileSync } from "node:fs";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error(
    'Uso: node scripts/set-admin-password.mjs "NovaSenha" (mínimo 10 caracteres)',
  );
  process.exit(1);
}

const ADMIN_EMAIL = "danilowendler@gmail.com";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const listRes = await fetch(`${url}/auth/v1/admin/users?per_page=100`, {
  headers,
});
const list = await listRes.json();
const user = (list.users ?? []).find((u) => u.email === ADMIN_EMAIL);
if (!user) {
  console.error(`Usuário ${ADMIN_EMAIL} não encontrado.`);
  process.exit(1);
}

const res = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ password }),
});

if (res.ok) {
  console.log(`Senha de ${ADMIN_EMAIL} atualizada com sucesso.`);
} else {
  console.error(`Falha (HTTP ${res.status}):`, await res.text());
  process.exit(1);
}
