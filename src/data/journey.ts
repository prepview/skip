export type Topic = 'body' | 'sleep' | 'mind';

/** Journey entries. An entry opens once the longest alcohol-free run reaches `day`, and never closes again. */
export const journeyEntries: readonly { id: string; day: number; topic: Topic }[] = [
  { id: 'sleep1', day: 1, topic: 'sleep' },
  { id: 'water1', day: 1, topic: 'body' },
  { id: 'sleep7', day: 7, topic: 'sleep' },
  { id: 'stomach14', day: 14, topic: 'body' },
  { id: 'liver30', day: 30, topic: 'body' },
  { id: 'mind90', day: 90, topic: 'mind' },
];

export const topics: readonly Topic[] = ['body', 'sleep', 'mind'];
