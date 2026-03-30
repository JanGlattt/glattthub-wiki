# 🧪 API Live-Tester

Interaktive Swagger-UI zum Testen der glatttHub REST-API direkt im Browser.

→ Zurück zur [REST-API Übersicht](REST-API.md) | [Endpoint-Referenz](REST-API-ENDPOINTS.md)

---

## So funktioniert's

1. **Server auswählen** — Oben in der Swagger-UI zwischen **Staging**, **Produktion** und **Lokal** wählen
2. **Authorize** — Klicke auf den 🔒 **Authorize**-Button und trage deinen `glh_`-Token ein
3. **Endpoint aufklappen** — Wähle einen Endpoint aus der Liste
4. **Try it out** — Klicke auf "Try it out", fülle ggf. Parameter aus
5. **Execute** — Klicke auf "Execute" und sieh die Antwort

!!! warning "Achtung"
    - **Staging** nutzen zum Testen — Produktion nur wenn nötig
    - Requests gehen **live** gegen die echte API mit echten Daten
    - Rate-Limit: 60 Requests/Minute pro API-Client

!!! tip "Token erstellen"
    API-Tokens werden unter **Hub → Einstellungen → API-Zugänge** erstellt. Berechtigung: `manage_api_clients`.

---

## API-Explorer

<swagger-ui src="api-spec/openapi.yaml"/>
