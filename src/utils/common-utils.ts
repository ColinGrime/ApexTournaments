/**
 * @param offset offset time (in seconds)
 * @returns the current time in seconds, plus any offset
 */
export function getTime(offset: number = 0) {
    return (new Date().getTime() / 1000) + offset;
}

/**
 * Checks if two arrays are equal.
 * @param a any array
 * @param b any array
 * @returns true if the two arrays are the same
 */
export function isEqual(a: any[], b: any[]): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // Check if each element is the same.
    for (var i=0; i<a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
  }