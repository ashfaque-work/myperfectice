export function padWithZeroes(number: string | number, length: number): string {
    let myString = String(number);
    while (myString.length < length) {
        myString = '0' + myString;
    }
    return myString;
}

export function getRandomCode(digitLength: number): string {
    const chars = "ABCD45EFGHJKM0123NPQRSTU67VWXY89Z";
    let code = '';
    for (let i = 0; i < digitLength; i++) {
        const rnum = Math.floor(Math.random() * chars.length);
        code += chars.substring(rnum, rnum + 1);
    }
    return code.toUpperCase();
}

var escapeRegex = function (search: string) {
    return search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''; // $& means the whole matched string
}

export function regexCode(testCode: string) {
    let pattern = '\\b' + escapeRegex(testCode) + '\\b'
    return new RegExp(pattern, 'i');
}