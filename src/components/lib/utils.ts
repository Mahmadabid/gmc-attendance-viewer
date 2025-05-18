// Adds or updates Max-Age and expires in a Set-Cookie header string for a new duration (in seconds)
export function updateCookieMaxAgeAndExpires(setCookie: string, days: number): string {

    const newMaxAge = 60 * 60 * 24 * days; // 300 days

    const newExpires = new Date(Date.now() + newMaxAge * 1000).toUTCString();
    return setCookie
        .replace(/Max-Age=\d+/, `Max-Age=${newMaxAge}`)
        .replace(/expires=[^;]+;/i, `expires=${newExpires};`);
}

export const FetchURL = '/api/dummy';

export enum FetchStatus {
    true = 'true',
    false = 'false',
}