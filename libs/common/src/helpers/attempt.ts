import { Logger } from "@nestjs/common";


function simplifyMML(mml) {
    mml = mml.replace(/<!--(.*?)-->/g, "") // remove comments
        .replace(/(<[a-zA-Z]+)(.*?)(\/?>)/g, "$1$3") // Remove attributes
        .replace(/(<mstyle>|<\/mstyle>)/g, "") // Remove style tag
        .replace(/(&#xA0;|\s+)/g, " ") // Convert space code to actual space character
        .replace(/<([a-zA-Z]+)>\s+<\/\1>/g, "") // Remove sections that only contains spaces/tabs
        .replace(/(>)\s+|\s+(<)/g, "$1") // Trim content in between tags
        .replace(/<([a-zA-Z]+)><\/\1>/g, "<$1/>") // Convert empty tags into self closing tags
        .replace(/(<mrow>|<\/mrow>)/g, ""); // remove <mrow> tag

    // Convert hex math sign to normal
    mml = mml.replace(/&#x2212;/g, '-').replace(/&#x2b;/g, '+').replace(/&#x3d;/g, '=').replace(/&#x00D7;/g, 'x').replace(/<mo>/g, '<mi>').replace(/<\/mo>/g, '<\/mi>')

    return mml
};

function mathmlCompare(mml1, mml2) {
    return simplifyMML(mml1) == simplifyMML(mml2);
};

function compareString(str1, str2) {
    if (str1 === str2) {
        return true;
    } else {
        return false
    }
}

function round(value, dec) {
    return Math.round((value + Number.EPSILON) * 10 * dec) / (10 * dec);
}


export const fibAnswerCompare = (actualAnswer, userAnswer) => {
    try {
        if (actualAnswer.answerText.indexOf('<math ') > -1) {
            var isEqual = mathmlCompare(userAnswer.answerText, actualAnswer.answerText)
            if (isEqual) {
                return true
            }
        } else {
            actualAnswer = String(actualAnswer.answerText).replace(/<[^>]+>/gm, '');
            if (!isNaN(actualAnswer) || !isNaN(actualAnswer.split('|')[0]) || !isNaN(actualAnswer.split('_')[0])) {
                // in case the answer is number
                var rIndex = actualAnswer.indexOf('_');
                let absoluteRange = actualAnswer.indexOf('|');
                var ans = userAnswer.answerText;
                ans = ans ? ans.replace(/,/g, '') : ans

                if (rIndex >= 0) {
                    let range = actualAnswer.split('_')
                    var lR = range[0]
                    var hR = range[1]
                    if (range.length == 2 && (Number(ans) >= lR) && (Number(ans) <= hR)) {
                        return true
                    }
                } else if (absoluteRange >= 0) {
                    let ranges = actualAnswer.split('|')

                    if (ranges.indexOf(ans) !== -1) {
                        return true
                    }
                } else {
                    if (Number(actualAnswer).toFixed(2) == Number(ans).toFixed(2)) {
                        return true
                    }
                }

            } else {
                // answerText maybe not text but number => toLowerCase not exist for number
                actualAnswer = actualAnswer.replace('\n', '').toLowerCase()
                // convert html code to correct sign
                actualAnswer = actualAnswer.replace('&gt;', '>').replace('&lt;', '<').replace('&nbsp;', ' ')
                // replace spaces with one space
                let answers = actualAnswer.split('||').map(a => a.trim())
                if (userAnswer.answerText) {
                    var userAnswerToCompare = userAnswer.answerText.toString().toLowerCase().replace(/  +/g, ' ').trim();
                    if (answers.indexOf(userAnswerToCompare) > -1) {
                        return true;
                    }
                }
            }
        }
    } catch (err) {
        Logger.error('fail to compare fib answer')
        Logger.error(err)
    }

    return false
}

export const mixmatchAnswerCompare = (actualAnswer, userAnswer) => {
    try {
        if (actualAnswer.answerText && userAnswer.userText) {
            var isEqual = compareString(userAnswer.userText, actualAnswer.correctMatch)
            if (isEqual) {
                return true
            } else {
                return false
            }
        }
    } catch (err) {
        Logger.error('fail to compare mixmatch answer')
        Logger.error(err)
    }

    return false
}

export const codingAnswerCompare = (correctOutput, userOutput) => {
    const allOutputs = correctOutput.split('@@@@@')
    return allOutputs.findIndex(co => co.trim() == userOutput.trim()) > -1
}

export const codingPartialMark = (test, question, testcases, timeLimit, memLimit) => {
    if (!test.enableMarks) {
        return 0
    }
    var maxMark = !test.isMarksLevel ? question.plusMark : test.plusMark
    var maxMarkPerTestcase = maxMark / testcases.length;

    // calculate mark for each testcase
    var mark = 0
    for (var i = 0; i < testcases.length; i++) {
        var tcMark = 0
        if (testcases[i].status) {
            var t = testcases[i].runTime && timeLimit ? testcases[i].runTime / (timeLimit * 1000) : 1;
            var s = testcases[i].memory && memLimit ? testcases[i].memory / memLimit : 1;
            tcMark = maxMarkPerTestcase / (s * t)
            mark += tcMark > maxMarkPerTestcase ? maxMarkPerTestcase : tcMark;
        }
    }
    return round(mark, 2)
}

