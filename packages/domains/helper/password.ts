// Ambiguous characters (0/O, 1/l/I) are left out so the password is easy to copy by hand.
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomInt(max: number): number {
    // Rejection sampling avoids modulo bias.
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
        crypto.getRandomValues(buf);
    } while (buf[0]! >= limit);
    return buf[0]! % max;
}

function pick(chars: string): string {
    return chars[randomInt(chars.length)]!;
}

/**
 * Generates a cryptographically random temporary password that always
 * contains at least one uppercase letter, lowercase letter, digit and symbol.
 */
export function generateTemporaryPassword(length: number = 12): string {
    const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
    while (chars.length < length) chars.push(pick(ALL));

    // Fisher-Yates shuffle so the required characters are not always first.
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j]!, chars[i]!];
    }
    return chars.join('');
}
