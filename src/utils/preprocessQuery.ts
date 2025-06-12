export function preprocessQuery(query: string): string {
  let q = query.toLowerCase().trim();
  q = q.replace(/section(\d+)/g, 'section $1');
  q = q.replace(/(bns|bnss|bsa|ipc|crpc|iea)(section| sec)(\d+)/g, '$1 section $3');
  return q.replace(/\s+/g, ' ');
} 