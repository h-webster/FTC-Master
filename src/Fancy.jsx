export function Ordinalize(num) {
    if (num % 10 == 1) {
        return `${num}st`;
    }
    if (num % 10 == 2) {
        return `${num}nd`;
    }
    if (num % 10 == 3) {
        return `${num}rd`;
    }
    return `${num}th`;
}

export function TeamNotFound(data) {
    if (JSON.stringify(data).includes("Parameter Format In Request")) {
        return true;
    }
    return false;
}