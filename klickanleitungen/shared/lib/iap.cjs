/* IAP passieren: Die Hub-Domains (hub.glattt.com, staging.hub.glattt.com) liegen hinter Google IAP,
   und ein Headless-Browser kann die Google-Anmeldung nicht durchlaufen. Seit 23.09.2026 gibt es
   auch keinen Umweg mehr über die *.run.app-Adresse (Ingress nur noch über den Load Balancer).

   Stattdessen: ein OIDC-Token des Dienstkontos `klickanleitungen@glattthub.iam.gserviceaccount.com`
   im Header `Authorization: Bearer …`. IAP prüft ihn und reicht die Anfrage durch; danach meldet
   sich der Lauf wie gehabt mit dem Testzugang an. (`Proxy-Authorization` wäre sauberer, weil IAP
   den Header entfernt — Chromium weigert sich aber, ihn als Extra-Header zu senden
   (`net::ERR_INVALID_ARGUMENT`). Der Hub ignoriert den fremden Bearer-Token: Sanctum prüft die
   Sitzung zuerst, Web-Routen lesen den Header gar nicht.)
   Das Dienstkonto hat genau eine Rolle (IAP-secured Web App User auf den beiden Hub-Backends).
   Das Token entsteht per Impersonation mit dem eigenen gcloud-Login — keine Schlüsseldatei,
   nichts zu committen. Voraussetzung: Rolle „Service Account Token Creator" auf dem Dienstkonto.

   Lokale Adressen (glattthub.local, localhost) brauchen keinen Header.                           */
const { execFileSync } = require('child_process');

const SA = process.env.KLICK_IAP_SA || 'klickanleitungen@glattthub.iam.gserviceaccount.com';
// Audience = Client-ID des EIGENEN IAP-OAuth-Clients (Google Auth Platform → Clients, Typ Web-Anwendung),
// mit dem IAP auf den Hub-Backends konfiguriert ist. Der von Google verwaltete Standard-Client
// (369001918367-…) lässt laut Google-Doku keinen programmatischen Zugang zu („Invalid JWT audience").
const AUDIENCE = process.env.KLICK_IAP_AUDIENCE || '99200336070-1n78g13leh01h24nqoh6ar8lcm01em63.apps.googleusercontent.com';

let cached = null;

function needsIap(base) {
  if (process.env.KLICK_IAP === '0') return false;
  return !/^(https?:\/\/)?(localhost|127\.0\.0\.1|glattthub\.local)(:|\/|$)/.test(String(base || ''));
}

/** OIDC-Token des Dienstkontos (gültig 1 h; je Prozess einmal geholt). */
function token() {
  if (cached) return cached;
  if (!AUDIENCE) { console.error('KLICK_IAP_AUDIENCE fehlt — Client-ID des eigenen IAP-OAuth-Clients (siehe README, Abschnitt Zugang).'); process.exit(2); }
  try {
    cached = execFileSync('gcloud', [
      'auth', 'print-identity-token',
      '--impersonate-service-account=' + SA,
      '--audiences=' + AUDIENCE,
      '--include-email',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    const err = String(e.stderr || e.message || '').split('\n').filter(l => /ERROR|denied|not found|nicht/i.test(l)).join(' ').slice(0, 300);
    console.error('IAP-Token konnte nicht geholt werden — gcloud angemeldet (gcloud auth login) und Token Creator auf ' + SA + '? ' + err);
    process.exit(2);
  }
  if (!cached) { console.error('IAP-Token leer.'); process.exit(2); }
  return cached;
}

/** Zusätzliche Header für den Browser-Kontext (Playwright `extraHTTPHeaders`). */
function headers(base) {
  return needsIap(base) ? { Authorization: 'Bearer ' + token() } : {};
}

module.exports = { headers, needsIap, token, SA, AUDIENCE };
