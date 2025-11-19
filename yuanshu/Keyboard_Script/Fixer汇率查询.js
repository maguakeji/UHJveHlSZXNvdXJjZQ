// 功能: 使用 Fixer API 汇率接口，支持输入金额与基准货币自动转换
// 示例: 输入 "100美元" 或 "50 usd" 或不输入（默认 1 USD）
// 需要申请API，添加变量名称key，值填写API


const FIXER_API_KEY = $key;  // ← 你的 Fixer API key
const FIXER_URL = `http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}`;

const currencyNames = {
  cny: ["人民币", "🇨🇳"],
  usd: ["美元", "🇺🇸"],
  hkd: ["港币", "🇭🇰"],
  jpy: ["日元", "🇯🇵"],
  eur: ["欧元", "🇪🇺"],
  gbp: ["英镑", "🇬🇧"],
};

let defaultBaseCurrency = "usd"; // 默认基准货币

// 主函数
async function output() {
  const text = $searchText;
  const precision = 4;

  // 解析输入金额与货币
  const { amount, baseCurrency } =
    extractAmountAndCurrency(text) || { amount: 1, baseCurrency: defaultBaseCurrency };

  const exchangeData = await getCurrencyData(); // 获取 EUR 基准的所有汇率
  if (!exchangeData || !exchangeData.success) {
    return "❌ 获取汇率数据失败";
  }

  // 计算从 baseCurrency → 其他货币的实际汇率
  const result = formatExchangeRates(exchangeData.rates, baseCurrency, amount, precision);
  return result;
}

// 提取数字与货币
function extractAmountAndCurrency(text) {
  if (!text) return { amount: 1, baseCurrency: defaultBaseCurrency };

  const regex = /(\d+(\.\d+)?)\s*([a-zA-Z]+|[\u4e00-\u9fa5]+)?/;
  const match = text.match(regex);

  if (match) {
    const amount = parseFloat(match[1]);
    const currencyText = match[3]?.toLowerCase();

    if (currencyText) {
      for (const [currency, [name]] of Object.entries(currencyNames)) {
        if (currency === currencyText || name.includes(currencyText)) {
          return { amount, baseCurrency: currency };
        }
      }
    }
    return { amount, baseCurrency: defaultBaseCurrency };
  }
  return { amount: 1, baseCurrency: defaultBaseCurrency };
}

// 获取 Fixer 汇率（EUR 基准）
async function getCurrencyData() {
  try {
    const resp = await $http({ url: FIXER_URL, method: "GET" });
    return typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
  } catch (error) {
    $log(error);
    return null;
  }
}

// 计算汇率（任意基准）
function formatExchangeRates(rates, baseCurrency, amount = 1, precision = 4) {
  const result = [];

  const base = baseCurrency.toUpperCase();
  const eurToBase = rates[base];

  if (!eurToBase) {
    return `基准货币 ${baseCurrency} 不存在或无效`;
  }

  const [baseCurrencyName, baseFlag] = currencyNames[baseCurrency.toLowerCase()] || [baseCurrency, ""];

  for (const [currency, [foreignCurrencyName, foreignFlag]] of Object.entries(currencyNames)) {
    if (currency === baseCurrency.toLowerCase()) continue;

    const eurToForeign = rates[currency.toUpperCase()];
    if (!eurToForeign) continue;

    // 核心公式： 1 base = (EUR→foreign / EUR→base)
    const rate = eurToForeign / eurToBase;
    const convertedAmount = (amount * rate).toFixed(precision);

    result.push(
      `${amount} ${baseCurrencyName} ${baseFlag} 兑 ${convertedAmount} ${foreignCurrencyName} ${foreignFlag}`
    );
  }

  return result;
}
