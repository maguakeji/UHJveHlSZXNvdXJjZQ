// author: 叙白
// name: 汇率.js
// data: 2024-09-26
// 使用: 不在输入框中输入数字，直接点击按钮，则默认转换为 1 基准货币 兑 其他货币汇率。
// 输入框中输入数字，则转换为输入数字 基准货币 兑 其他货币汇率。
const currencyNames = {
    cny: ["人民币", "🇨🇳"],
    usd: ["美元", "🇺🇸"],
    hkd: ["港币", "🇭🇰"],
    jpy: ["日元", "🇯🇵"],
    eur: ["欧元", "🇪🇺"],
    gbp: ["英镑", "🇬🇧"],
};
let defaultBaseCurrency = "cny"; // 全局设置基准货币

// 异步函数来处理汇率转换
async function output() {
    let text = $searchText;
    const precision = 4; // 保留小数

    // 检测并提取输入的数字和基准货币
    const { amount, baseCurrency } = extractAmountAndCurrency(text) || { amount: 1, baseCurrency: defaultBaseCurrency };

    const exchangeData = await getCurrencyData(baseCurrency);

    const result = formatExchangeRates(exchangeData, baseCurrency, amount, precision);
    return result;
}

function extractAmountAndCurrency(text) {
    if (!text) return { amount: 1, baseCurrency: defaultBaseCurrency }; // 默认值处理

    // 匹配数字（可以是小数）和货币代码或名称
    const regex = /(\d+(\.\d+)?)\s*([a-zA-Z]+|[\u4e00-\u9fa5]+)?/;
    const match = text.match(regex);

    if (match) {
        const amount = parseFloat(match[1]);
        const currencyText = match[3]?.toLowerCase();

        // 如果匹配到货币种类，返回对应的货币，否则使用默认基准货币
        if (currencyText) {
            for (const [currency, [name]] of Object.entries(currencyNames)) {
                if (currency === currencyText || name.includes(currencyText)) {
                    return { amount, baseCurrency: currency };
                }
            }
        }

        // 没有匹配到货币时，使用全局默认的基准货币
        return { amount, baseCurrency: defaultBaseCurrency };
    }

    return { amount: 1, baseCurrency: defaultBaseCurrency };
}

async function getCurrencyData(baseCurrency) {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency}.json`;
    try {
        const resp = await $http({ url: url, method: 'GET' });
        const jsonData = JSON.parse(resp.data);
        return jsonData;
    } catch (error) {
        $log(error);
        return null;
    }
}

// 格式化汇率转换的逻辑，增加 amount 参数
function formatExchangeRates(data, baseCurrency, amount = 1, precision = 4) {
    const result = [];

    // 获取基准货币对其他货币的汇率
    const baseRates = data[baseCurrency];

    if (!baseRates || !currencyNames[baseCurrency]) {
        return `基准货币 ${baseCurrency} 不存在或无效`;
    }

    const [baseCurrencyName, baseFlag] = currencyNames[baseCurrency];

    // 遍历本地 currencyNames
    for (const [currency, [foreignCurrencyName, foreignFlag]] of Object.entries(currencyNames)) {
        if (currency === baseCurrency) {
            continue; // 跳过基准货币
        }

        const rate = baseRates[currency];
        if (rate) {
            const convertedAmount = (amount * rate).toFixed(precision);
            result.push(`${amount} ${baseCurrencyName} ${baseFlag} 兑 ${convertedAmount} ${foreignCurrencyName} ${foreignFlag}`);
        }
    }
    return result;
}
