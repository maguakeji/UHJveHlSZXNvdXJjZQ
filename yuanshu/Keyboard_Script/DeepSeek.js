// author: 叙白
// date: 2025-07-16
// name: DeepSeek.js
// 注意：请在脚本中的变量功能中添加 deepseek_key 变量，值为 DeepSeek 的 API Key
// 如果您使用转发平台的 API ，则值为转发平台的 API Key, 并且修改 BASE_URL
// 此脚本兼容 OpenAI 格式 (openai, deepseek, kimi 等)

const BASE_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";
const TEMPERATURE = 1.3; // 通用对话推荐温度
try {
  API_KEY = $deepseek_key;
} catch (ReferenceError) {
  API_KEY = null;
}

async function deepseekDemo(question) {
  // 参数验证
  if (API_KEY == null) {
    return "未获取到api key，请在脚本页面右上面变量页面添加deepseek_key变量，值为deepseek平台提供的api key"
  }

  if (!question || typeof question !== 'string') {
    return '无效的提问内容';
  }

  isShortAnswer = !question.endsWith('-');
  const systemPrompt = `你是一位AI助手，能够回答的专业以及准确${isShortAnswer ? "，现在请尽量用一句话回答我的问题" : ""}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question }
  ];

  const response = await $http({
    url: BASE_URL,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: {
      messages: messages,
      model: MODEL,
      temperature: TEMPERATURE
    },
    timeout: 30,
  });

  // 处理HTTP异常状态码
  if (response.response.statusCode != 200) {
    let errorMessage = `API请求失败 (HTTP ${response.response.statusCode})`;

    // 尝试解析错误详情
    try {
      const errorData = JSON.parse(response.data);
      if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      } else {
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      }
    } catch (parseError) {
      errorMessage += ` - 原始响应: ${response.data}`;
    }

    $log(`HTTP错误: ${errorMessage}`);
    return `请求失败: ${errorMessage}`;
  }

  // 解析JSON响应
  let responseData;
  try {
    responseData = JSON.parse(response.data);
  } catch (parseError) {
    const errorMessage = `响应数据解析失败: ${response.data}`;
    $log(`JSON解析错误: ${errorMessage}`);
    return `收到不可解析的响应数据`;
  }


  // 验证响应结构
  if (!responseData.choices || !Array.isArray(responseData.choices) ||
    responseData.choices.length === 0) {
    const errorMessage = `无效的响应格式: ${JSON.stringify(responseData)}`;
    $log(errorMessage);
    return '收到无效的响应数据';
  }

  const content = responseData.choices[0].message?.content;
  if (!content) {
    $log(`响应中缺少内容字段: ${JSON.stringify(responseData)}`);
    return '未收到有效的回复内容';
  }

  return content;


}

async function output() {
  // 输入优先级：搜索框 > 剪贴板
  const question = $searchText || $pasteboardContent;

  return await deepseekDemo(question);
}
