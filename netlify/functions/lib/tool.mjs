// netlify/functions/lib/tool.mjs
import { OFFER_KEYS } from './kb.mjs';

export const presenteerAdviesTool = {
  name: 'presenteer_advies',
  description:
    'Toon de bezoeker een advieskaart met het best passende Morgen Academy-aanbod. Roep dit aan zodra je genoeg weet om te adviseren.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      offer_key: {
        type: 'string',
        enum: OFFER_KEYS,
        description: 'De key van het best passende aanbod.',
      },
      vervolg_keys: {
        type: 'array',
        description: '0 tot 2 logische vervolgstappen na dit aanbod.',
        items: { type: 'string', enum: OFFER_KEYS },
      },
    },
    required: ['offer_key', 'vervolg_keys'],
    additionalProperties: false,
  },
};
