export function escapeRegex(search) {
    return search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}
export function isEmail(text) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return text && re.test(text);
};

export function getUniqueCode(length) {
    return Math.random().toString(36).substr(2, length).toUpperCase();
}

export function isNumber(text) {
    let re = /^\d+$/;
    return re.test(text)
}

export function validateName(name) {
    let res = /^[A-Za-z'& ]+$/
    return name && res.test(name)
}

export function validatePassword(pass) {
    let res = /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/
    return pass && res.test(pass)
}

export function urlJoin(...args: any[]): string {
    let input = args;
    let options = {};

    if (typeof args[0] === 'object') {
        // new syntax with array and options
        input = args[0];
        options = args[1] || {};
    }

    function normalize(strArray: string[], options: any): string {
        const resultArray = [];

        // If the first part is a plain protocol, we combine it with the next part.
        if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
            const first = strArray.shift();
            strArray[0] = first + strArray[0];
        }

        // There must be two or three slashes in the file protocol, two slashes in anything else.
        if (strArray[0].match(/^file:\/\/\//)) {
            strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
        } else {
            strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
        }

        for (let i = 0; i < strArray.length; i++) {
            var component: any = strArray[i];

            if (typeof component !== 'string') {
                component = (component && component.toString()) || '';
            }

            if (i > 0) {
                // Removing the starting slashes for each component but the first.
                component = component.replace(/^[\/]+/, '');
            }
            if (i < strArray.length - 1) {
                // Removing the ending slashes for each component but the last.
                component = component.replace(/[\/]+$/, '');
            } else {
                // For the last component we will combine multiple slashes to a single one.
                component = component.replace(/[\/]+$/, '/');
            }

            resultArray.push(component);
        }

        let str = resultArray.join('/');
        // Each input component is now separated by a single slash except the possible first plain protocol part.

        // remove trailing slash before parameters or hash
        str = str.replace(/\/(\?|&|#[^!])/g, '$1');

        // replace ? in parameters with &
        const parts = str.split('?');
        str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

        return str;
    }

    return normalize([].slice.call(input), options);
}
