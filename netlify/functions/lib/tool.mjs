// netlify/functions/lib/tool.mjs
import { OFFER_KEYS } from './kb.mjs';

export const presenteerAdviesTool = {
  name: 'presenteer_advies',
  description:
    'Toon de bezoeker een advieskaart met de best passende richting binnen Morgen (leren, laten implementeren of laten bouwen). Roep dit aan zodra je genoeg weet om te adviseren.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      offer_key: {
        type: 'string',
        enum: OFFER_KEYS,
        description: 'De key van het best passende aanbod.',
      },
      waarom: {
        type: 'string',
        description:
          'Korte, persoonlijke rationale (1 tot 2 zinnen) die de situatie van de bezoeker koppelt aan waarom dit past en wat het hen concreet oplevert. Geen algemene marketingtekst; verwijs naar wat ze net vertelden.',
      },
      vervolg_keys: {
        type: 'array',
        description: '0 tot 2 logische vervolgstappen na dit aanbod.',
        items: { type: 'string', enum: OFFER_KEYS },
      },
    },
    required: ['offer_key', 'waarom', 'vervolg_keys'],
    additionalProperties: false,
  },
};
