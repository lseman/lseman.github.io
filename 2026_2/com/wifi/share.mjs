// Shareable links: the lab state (plus an optional title and goal) deflated into the URL fragment.
// The fragment never reaches the server, so links work on any static host and nothing is uploaded.
//   #lab=z.<base64url(deflate-raw(json))>   full network ("j." prefix: uncompressed fallback)
//   #cenario=<key>                           built-in scenario
const LAB = '#lab=', SCENARIO = '#cenario=';

const toB64url = bytes => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

// payload: { title, goal, state }
export async function encodeShare(payload) {
    const json = new TextEncoder().encode(JSON.stringify({ v: 1, ...payload }));
    if (typeof CompressionStream === 'undefined') return `j.${toB64url(json)}`;
    return `z.${toB64url(await pipe(json, new CompressionStream('deflate-raw')))}`;
}
export async function decodeShare(code) {
    const [kind, data] = [code.slice(0, 2), code.slice(2)];
    if (kind !== 'z.' && kind !== 'j.') throw Error('formato de link desconhecido');
    let payload;
    try {
        let bytes = fromB64url(data);
        if (kind === 'z.') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
        payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch { throw Error('link corrompido ou incompleto'); }
    if (!Array.isArray(payload.state?.devices)) throw Error('o link não contém uma rede');
    return payload;
}

export const labLink = (base, code) => `${base}${LAB}${code}`;
export const scenarioLink = (base, key) => `${base}${SCENARIO}${encodeURIComponent(key)}`;
// What a location hash asks for: { lab: code } | { scenario: key } | null.
export function parseShareHash(hash) {
    if (hash.startsWith(LAB)) return { lab: hash.slice(LAB.length) };
    if (hash.startsWith(SCENARIO)) return { scenario: decodeURIComponent(hash.slice(SCENARIO.length)) };
    return null;
}
