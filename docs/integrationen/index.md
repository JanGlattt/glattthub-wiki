# Integrationen

<p class="gh-sub">Externe Systeme, die eigene REST-API des Hubs und die WordPress-Plugins auf glattt.com — Authentifizierung, Endpunkte, Webhooks, Fallstricke.</p>

| System | Zweck | Service im Hub |
|---|---|---|
| [Phorest](../PHOREST-API.md) | Salon-Software, **primäre Datenquelle** (Kunden, Termine, Branches, Staff, Gutscheine); Rückschreiben von Käufen | `PhorestApiService`, `PhorestContractPurchaseService` |
| [GoCardless](../GOCARDLESS-API.md) | SEPA-Lastschriften — jede Rate eine Einzelzahlung, Mandate, Webhooks | `GoCardlessApiService`, `GoCardlessPaymentPlanService` |
| Mollie | Zahlungsabwicklung Gutschein-Verkauf (+ Refunds), Event-Webhooks | `MolliePaymentService` — siehe [Gutschein-Verkauf](../GUTSCHEIN-VERKAUF.md) |
| [Superchat](../SUPERCHAT-WHATSAPP.md) | WhatsApp-Kommunikation, Kontakt-Sync, Terminattribut | `SuperchatApiService`, `SuperchatComposerService` |
| [Zendesk](../ZENDESK-API.md) | Support-Tickets, verknüpft mit Widerrufen | `ZendeskApiService` |
| Meta Ads / Google Ads | Kampagnen-Kosten und Conversion-Upload | `MetaAdsService`, `GoogleAdsService` — siehe [Ads-Analyse](../ADS-ANALYSE.md), [Conversion-Upload](../CONVERSION-UPLOAD.md) |
| [askDANTE](../ASKDANTE-API.md) | Dienstplan/Abwesenheiten (Reisekosten-Anspruch) | `AskDanteApiService` |
| OpenAI / Gemini / Vertex AI | glatttBert, Namensherkunft, Embeddings der Portal-Suche | `OpenAiAssistantService`, `GeminiNameClassifier` |

<div class="grid cards" markdown>

- :material-api: **REST-API des Hubs**

    ---

    Token-Scopes, Endpoint-Referenz mit Swagger, Live-Tester, Booking-Tracking für die Website.

    [:octicons-arrow-right-24: REST-API](../REST-API.md) · [Endpunkte](../REST-API-ENDPOINTS.md) · [Booking-Tracking](../BOOKING-TRACKING.md)

- :material-wordpress: **WordPress (glattt.com)**

    ---

    Sechs Plugins: Buchungswidget, Anfahrt, FAQ, Rechner, Bewertungen, Medien-Ordner — mit Versions-Bumps, Vorschau-Harness und Berührungspunkten zum Hub.

    [:octicons-arrow-right-24: Plugins (Übersicht)](../WORDPRESS-PLUGINS.md)

</div>
