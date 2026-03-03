# MAMP Virtual Host Setup - Anleitung

## Problem gelöst! 🎉

Die Laravel-Anwendung glatttHub ist jetzt korrekt für MAMP Port 8888 konfiguriert.

## Was wurde geändert:

1. ✅ Virtual Host für Port 8888 erstellt (statt Port 80)
2. ✅ APP_URL in .env auf `http://glattthub.local:8888` geändert
3. ✅ Saubere Apache-Konfiguration erstellt
4. ✅ Apache-Syntax validiert

## Nächste Schritte:

### 1. MAMP Apache neu starten
- Öffnen Sie MAMP
- Klicken Sie auf "Stop Servers"
- Klicken Sie auf "Start Servers"
- Warten Sie bis beide Server (Apache & MySQL) grün sind

### 2. Website testen
- Öffnen Sie Ihren Browser
- Navigieren Sie zu: **http://glattthub.local:8888**
- Sie sollten die Laravel-Willkommensseite sehen

### 3. Admin Panel testen
- Navigieren Sie zu: **http://glattthub.local:8888/admin**
- Loggen Sie sich ein mit:
  - Email: `admin@glattt.com`
  - Passwort: [Ihr während der Installation eingegebenes Passwort]

### 4. Weitere Features testen
- Registration: http://glattthub.local:8888/register
- Login: http://glattthub.local:8888/login
- Dashboard: http://glattthub.local:8888/dashboard

## Troubleshooting

Falls die Seite immer noch nicht erreichbar ist:

1. **Apache-Status prüfen:**
   ```bash
   lsof -i :8888
   ```

2. **Apache-Logs prüfen:**
   ```bash
   tail -f /Applications/MAMP/logs/apache_error.log
   ```

3. **Virtual Host Logs prüfen:**
   ```bash
   tail -f /Applications/MAMP/logs/glattthub_error.log
   ```

4. **DNS-Cache leeren (macOS):**
   ```bash
   sudo dscacheutil -flushcache
   ```

## Alternative: Direkte URL ohne Virtual Host

Falls der Virtual Host nicht funktioniert, können Sie die Anwendung weiterhin über die direkte URL erreichen:
- http://localhost:8888/glattthub/public/

Aber mit dem Virtual Host ist es viel sauberer: http://glattthub.local:8888