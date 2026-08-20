export const RESTRICTION_GROUP_ORDER = [
  'forbiddenSubjects',
  'forbiddenPromises',
  'nonInventableInformation',
  'humanOnlyCommercialTerms',
] as const;

export type RestrictionGroup = (typeof RESTRICTION_GROUP_ORDER)[number];

export const RESTRICTION_PREFIXES: Record<RestrictionGroup, string> = {
  forbiddenSubjects: 'ASSUNTO PROIBIDO — ',
  forbiddenPromises: 'NÃO PROMETER — ',
  nonInventableInformation: 'NÃO INVENTAR — ',
  humanOnlyCommercialTerms: 'SÓ COM HUMANO — ',
};

const PREFIX_RE =
  /^(ASSUNTO\s+PROIBIDO|N[AÃ]O\s+PROMETER|N[AÃ]O\s+INVENTAR|S[OÓ]\s+COM\s+HUMANO)\s*[—–-]\s*/i;

function fold(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const PREFIX_TO_GROUP: Record<string, RestrictionGroup> = {
  'assunto proibido': 'forbiddenSubjects',
  'nao prometer': 'forbiddenPromises',
  'nao inventar': 'nonInventableInformation',
  'so com humano': 'humanOnlyCommercialTerms',
};

export type RestrictionGroups = Record<RestrictionGroup, string[]>;

export function emptyRestrictionGroups(): RestrictionGroups {
  return {
    forbiddenSubjects: [],
    forbiddenPromises: [],
    nonInventableInformation: [],
    humanOnlyCommercialTerms: [],
  };
}

export function splitPrefixedRestriction(value: string): { group: RestrictionGroup | null; text: string } {
  const raw = value.trim();
  if (!raw) return { group: null, text: '' };
  const match = raw.match(PREFIX_RE);
  if (!match) return { group: null, text: raw };
  const group = PREFIX_TO_GROUP[fold(match[1])] ?? null;
  const text = raw.slice(match[0].length).trim();
  return { group, text: text || raw };
}

export function decodeRestrictions(items: string[] | undefined): RestrictionGroups {
  const groups = emptyRestrictionGroups();
  const seen: Record<RestrictionGroup, Set<string>> = {
    forbiddenSubjects: new Set(),
    forbiddenPromises: new Set(),
    nonInventableInformation: new Set(),
    humanOnlyCommercialTerms: new Set(),
  };
  for (const item of items ?? []) {
    const { group, text } = splitPrefixedRestriction(item);
    if (!text) continue;
    const dest = group ?? 'nonInventableInformation';
    const key = text.toLowerCase();
    if (seen[dest].has(key)) continue;
    seen[dest].add(key);
    groups[dest].push(text);
  }
  return groups;
}

export function encodeRestrictionGroups(groups: Partial<RestrictionGroups>): string[] {
  const encoded: string[] = [];
  const seen = new Set<string>();
  for (const group of RESTRICTION_GROUP_ORDER) {
    const prefix = RESTRICTION_PREFIXES[group];
    for (const item of groups[group] ?? []) {
      const { text } = splitPrefixedRestriction(item);
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      encoded.push(`${prefix}${text}`);
    }
  }
  return encoded;
}

export function hasRestrictionGroupItems(groups: Partial<RestrictionGroups>): boolean {
  return RESTRICTION_GROUP_ORDER.some((group) => (groups[group] ?? []).some((item) => item.trim()));
}
