// name: Calculator.js
// author: SW
// description: 一个支持基本运算和科学函数的输入法计算器脚本。

/**
 * 主函数，脚本的入口
 */
async function output() {
    const expression = $searchText || $pasteboardContent;

    if (!expression || expression.trim() === "") {
        return "请输入或选中一个数学表达式。";
    }

    try {
        const result = calculate(expression);

        if (isNaN(result) || !isFinite(result)) {
            return `计算结果无效: ${expression}`;
        }

        if (expression.includes('=')) {
            return result.toString();
        } else {
            const formattedResult = parseFloat(result.toPrecision(12));
            return `${expression.trim()} = ${formattedResult}`;
        }

    } catch (error) {
        return `计算失败: ${error.message}`;
    }
}

/**
 * 安全地计算数学表达式字符串
 * @param {string} rawExpression - 需要计算的数学表达式
 * @returns {number} - 计算结果
 */
function calculate(rawExpression) {
    // 1. 安全性校验
    const validExpressionRegex = /^[a-z0-9\s\.\+\-\*\/\%\^\(\),]+$/i;
    if (!validExpressionRegex.test(rawExpression)) {
        throw new Error("表达式包含非法字符。");
    }

    let expression = rawExpression
        .replace(/\^/g, '**') // a^b -> a**b (幂运算)
        // **【修正】**: 统一将所有 "pi" (不区分大小写) 替换为 JavaScript Math 环境认识的大写 "PI"
        .replace(/pi/gi, 'PI');

    // 2. 角度转弧度处理
    // **【修正】**: 在替换后的字符串里，使用大写的 "PI"
    expression = expression.replace(/sin\((.*?)\)/gi, (match, angle) => `sin((${angle}) * PI / 180)`);
    expression = expression.replace(/cos\((.*?)\)/gi, (match, angle) => `cos((${angle}) * PI / 180)`);
    // **【新增】**: 增加对 tan 函数的支持
    expression = expression.replace(/tan\((.*?)\)/gi, (match, angle) => `tan((${angle}) * PI / 180)`);

    try {
        // 3. 使用 `with(Math)` 执行计算，这里可以正确识别大写的 "PI"
        const result = new Function('with(Math){ return ' + expression + '}')();
        return result;
    } catch (e) {
        throw new Error("表达式语法错误。");
    }
}
