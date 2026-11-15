// Dati di PROVA per il Supabase locale (mai per il progetto online).
// Uso: node scripts/seed-local.mjs   (dopo `supabase start`)
// Crea utenti finti, giocatori, squadre, due giornate con punteggi, chat e
// un anno di Hall of Fame. Acquisti e squadre passano dalle funzioni vere
// del database (create_team, purchase_player), come farebbe l'app.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.LOCAL_SUPABASE_URL ?? "http://127.0.0.1:55321";
const ANON = process.env.LOCAL_SUPABASE_ANON_KEY;
const SERVICE = process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.LOCAL_TEST_PASSWORD ?? "prova-locale-123";

if (!ANON || !SERVICE) throw new Error("Servono LOCAL_SUPABASE_ANON_KEY e LOCAL_SUPABASE_SERVICE_ROLE_KEY");
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error("Questo script gira solo sul Supabase locale");

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
const must = (res, what) => {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
};

const USERS = [
  ["admin", "Admin Prova", null],
  ["marco_p", "Marco Prova", "Amantea Ballers"],
  ["giulia", "Giulia Prova", "Tirreno Hoops"],
  ["tonino", "Tonino Prova", "I Tre Secondi"],
  ["sara_b", "Sara Prova", "Campetto Kings"],
  ["peppe", "Peppe Prova", "Quelli del Lungomare Nord"],
  ["lollo", "Lollo Prova", "Schiacciata Calabra"],
  ["fede", "Fede Prova", "Rimbalzo Selvaggio"],
  ["nico", "Nico Prova", "Air Amantea"],
  ["vale", "Vale Prova", "Tripla Doppia"],
  ["ale99", "Ale Prova", "Street Legends"],
  ["senzasquadra", "Senza Squadra", null],
];

const REAL_TEAMS = ["Lungomare", "Campetto Sud", "Old School", "I Pirati", "Catocastro", "Rookie Squad"];
const NAMES = [
  "Luca Ferraro", "Matteo Greco", "Davide Russo", "Simone Bruno", "Andrea Gallo", "Paolo Conti",
  "Giorgio Marino", "Stefano Rizzo", "Antonio De Luca", "Francesco Maria Santoro", "Enzo Caruso", "Mario Leone",
  "Nicola Serra", "Vincenzo Fabbri", "Alessio Vitale", "Daniele Coppola", "Roberto Ferri", "Emanuele Costa",
  "Salvatore Longo", "Cristian Mele", "Fabio Sala", "Gianluca Neri", "Pietro Bassi", "Tommaso Villa",
];
const COSTS = [34, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 8, 7, 6, 5, 4];

// 1. Utenti
const ids = {};
for (const [username, fullName] of USERS) {
  const res = await admin.auth.admin.createUser({
    email: `${username}@prova.test`,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { username, full_name: fullName },
  });
  ids[username] = must(res, `utente ${username}`).user.id;
}
must(await admin.from("profiles").update({ role: "admin" }).eq("id", ids.admin), "ruolo admin");

// 2. Impostazioni e giocatori
must(await admin.from("settings").update({ value: true }).eq("key", "market_open"), "mercato aperto");
const players = must(
  await admin
    .from("players")
    .insert(NAMES.map((full_name, i) => ({ full_name, real_team: REAL_TEAMS[i % REAL_TEAMS.length], cost: COSTS[i] })))
    .select("id, full_name, cost"),
  "giocatori"
);

// 3. Squadre e acquisti, fatti da ogni utente con le funzioni vere
let seed = 7;
const rnd = (n) => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
for (const [username, , teamName] of USERS) {
  if (!teamName) continue;
  const client = createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  must(await client.auth.signInWithPassword({ email: `${username}@prova.test`, password: PASSWORD }), `login ${username}`);
  const team = must(await client.rpc("create_team", { p_team_name: teamName }), `squadra ${teamName}`);
  // marco_p (l'utente con cui si prova l'app) resta con posti e crediti liberi
  const wanted = username === "marco_p" ? 3 : 4 + rnd(3);
  let budget = 100;
  let bought = 0;
  const pool = [...players].sort(() => rnd(3) - 1);
  for (const p of pool) {
    if (bought >= wanted) break;
    if (p.cost > budget - (wanted - bought - 1) * 4) continue;
    const res = await client.rpc("purchase_player", { p_fantasy_team_id: team.id, p_player_id: p.id });
    if (res.error) continue;
    budget -= p.cost;
    bought += 1;
  }
}

// 4. Due giornate giocate: l'avvio congela le formazioni, poi i bonus, poi la chiusura
const bonus = must(await admin.from("bonus_types").select("id, code, points").eq("is_active", true), "bonus");
const matchdays = must(await admin.from("matchdays").select("id, number").order("number"), "giornate");
for (const md of matchdays.slice(0, 2)) {
  must(await admin.from("matchdays").update({ status: "open", match_date: `2026-07-2${4 + md.number}` }).eq("id", md.id), "avvio giornata");
  const events = [];
  for (const p of players) {
    const howMany = 1 + rnd(3);
    for (let k = 0; k < howMany; k++) {
      const b = bonus[rnd(bonus.length)];
      events.push({ matchday_id: md.id, player_id: p.id, bonus_type_id: b.id, quantity: 1 + rnd(3), created_by: ids.admin });
    }
  }
  must(await admin.from("player_score_events").insert(events), "bonus e malus");
  must(await admin.from("matchdays").update({ status: "closed" }).eq("id", md.id), "chiusura giornata");
}

// 5. Chat e Hall of Fame
const chat = [
  ["marco_p", "Ragazzi chi ha preso Ferraro? 34 crediti sono una rapina"],
  ["giulia", "Io. E ne è valsa la pena 😎"],
  ["tonino", "Seconda giornata disastrosa, due airball di fila"],
  ["admin", "Ricordo a tutti: il mercato chiude venerdì alle 18."],
  ["sara_b", "Qualcuno sa a che ora si gioca domani?"],
  ["marco_p", "Alle 19 al campetto del lungomare, come sempre"],
  ["peppe", "Classifica cortissima, tre squadre in dieci punti. Mi piace."],
];
for (const [username, content] of chat) {
  must(await admin.from("chat_messages").insert({ user_id: ids[username], content }), "messaggio chat");
}
must(
  await admin.from("hall_of_fame").insert([
    { year: 2025, winner_team_name: "Tirreno Hoops", winner_coach: "giulia", winner_points: 412, top_player_name: "Luca Ferraro", top_player_team: "Lungomare", top_player_points: 231, notes: "Edizione di prova." },
    { year: 2024, winner_team_name: "Old School Crew", winner_coach: "tonino", winner_points: 377, top_player_name: "Matteo Greco", top_player_team: "Campetto Sud", top_player_points: 198 },
  ]),
  "hall of fame"
);

console.log(`Fatto: ${USERS.length} utenti (email <username>@prova.test), ${players.length} giocatori, 2 giornate chiuse.`);
