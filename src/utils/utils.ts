export function getClickAmount(event: MouseEvent): number {
    let multiplier = 1;
    if (event.ctrlKey) {
        multiplier *= 5;
    }
    if (event.shiftKey) {
        multiplier *= 10;
    }
    return multiplier;
}

export function round1(num: number): number {
    return Math.floor(num * 10) / 10;
}

export function round2(num: number): number {
    return Math.floor(num * 100) / 100;
}

export function precision2(num: number): number {
    return Number(num.toPrecision(2));
}

export function precision3(num: number): number {
    return Number(num.toPrecision(3));
}

export function pxToInt(num: string): number {
    return parseFloat(num.substring(0, num.indexOf('px')));
}

export function formatNumber(num: number): string {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function withinDistance(x1: number, y1: number, x2: number, y2: number, radius: number): boolean {
    return getDistance(x1, y1, x2, y2) < radius;
}

export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

export function intToStringNegative(value: number, amount?: number): string {
    let isPositive = 1;
    if (value < 0) {
        isPositive = -1;
        value *= -1;
    }
    if (value >= 10000) {
        return (isPositive === 1 ? "+" : "-") + nFormatter(value, 3);
    } else {
        return (isPositive === 1 ? "+" : "-") + formatSmallNumber(value, amount);
    }
}

export function intToString(value: number, amount?: number): string {
    if (value >= 10000) {
        return nFormatter(value, 3);
    } else {
        return formatSmallNumber(value, amount);
    }
}

function formatSmallNumber(value: number, amount?: number): string {
    if (Number.isInteger(value)) {
        return value.toString();
    }
    let baseValue = 3;
    if (amount !== undefined) {
        baseValue = amount;
    }
    return value.toFixed(baseValue - 1).replace(format_regex, "$1");
}

export function intToStringRound(value: number): string | number {
    if (value >= 10000) {
        return nFormatter(value, 3);
    } else {
        return Math.floor(value);
    }
}

export function toSuffix(value: number): string {
    value = Math.round(value);
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "O", "N", "Dc", "Ud", "Dd", "Td", "qd", "Qd", "sd", "Sd", "Od", "Nd", "V"];
    const suffixNum = Math.floor((("" + value).length - 1) / 3);
    let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 !== 0) shortValue = parseFloat(shortValue.toPrecision(2));
    return shortValue + (suffixes[suffixNum] || "");
}

const format_symbol_table = [
    { value: 1E63, symbol: "V" },
    { value: 1E60, symbol: "Nd" },
    { value: 1E57, symbol: "Od" },
    { value: 1E54, symbol: "Sd" },
    { value: 1E51, symbol: "sd" },
    { value: 1E48, symbol: "Qd" },
    { value: 1E45, symbol: "qd" },
    { value: 1E42, symbol: "Td" },
    { value: 1E39, symbol: "Dd" },
    { value: 1E36, symbol: "Ud" },
    { value: 1E33, symbol: "Dc" },
    { value: 1E30, symbol: "N" },
    { value: 1E27, symbol: "O" },
    { value: 1E24, symbol: "Sp" },
    { value: 1E21, symbol: "Sx" },
    { value: 1E18, symbol: "Qi" },
    { value: 1E15, symbol: "Qa" },
    { value: 1E12, symbol: "T" },
    { value: 1E9, symbol: "B" },
    { value: 1E6, symbol: "M" },
    { value: 1E3, symbol: "K" }
];
const format_regex = /\.0+$|(\.[0-9]*[1-9])0+$/;
const nFormatCache = new Map<string, string>();

export function nFormatter(num: number, digits: number): string {
    const key = num + "|" + digits;
    const cached = nFormatCache.get(key);
    if (cached !== undefined) return cached;

    let result: string;
    let found = false;
    for (let i = 0; i < format_symbol_table.length; i++) {
        const entry = format_symbol_table[i];
        if (entry && (num) >= entry.value / 1.000501) { // /1.000501 to handle rounding
            result = (num / entry.value).toPrecision(digits).replace(format_regex, "$1") + entry.symbol;
            found = true;
            break;
        }
    }
    if (!found) {
        result = num.toPrecision(digits).replace(format_regex, "$1");
    }

    if (nFormatCache.size > 1000) {
        const firstKey = nFormatCache.keys().next().value;
        if (firstKey !== undefined) nFormatCache.delete(firstKey);
    }
    nFormatCache.set(key, result!);
    return result!;
}

let factorials: number[] = [];
export function factorial(n: number): number {
    if (n === 0 || n === 1)
        return 1;
    if (factorials[n] && factorials[n] > 0)
        return factorials[n];
    return factorials[n] = factorial(n - 1) * n;
}

export function sortArrayObjectsByValue(arr: any[], valueName: string): void {
    arr.sort((a, b) => a[valueName] - b[valueName]);
}

export async function encode(theSave: string): Promise<string> {
    const stream = new Blob([theSave]).stream().pipeThrough(new CompressionStream('gzip'));
    const response = new Response(stream);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
}

export async function decode(encodedSave: string): Promise<string> {
    if (!encodedSave) return "";
    const trimmed = encodedSave.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }
    try {
        const binaryString = atob(encodedSave);
        const bytes = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        return new Response(stream).text();
    } catch (e) {
        return encodedSave;
    }
}