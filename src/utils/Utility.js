/**
 * @param offset offset time (in seconds)
 * @returns the current time in seconds, plus any offset
 */
export function getTime(offset = 0) {
    return (new Date().getTime() / 1000) + offset;
}
