// author: 叙白
// date: 2024-09-25
// name: Deeplx.js
// 注意: 需添加变量deeplx_key
// 使用： 要翻译成英文或中文，在翻译文本前加“中/英”， 例： 中我要回家，将会翻译成英文

async function output() {
  const text = $searchText || $pasteboardContent;
  if (!text) return null; // 检查输入是否为空

  const langMap = {
    "中": "ZH",
    "英": "EN"
  };

  const target = langMap[text[0]]; // 根据首字符映射语言
  if (!target) return null; // 如果没有匹配到对应语言，直接返回

  const payload = {
    text: text.slice(1),
    source_lang: "auto",
    target_lang: target
  };

  try {
    const response = await $http({
      url: `https://api.deeplx.org/${$deeplx_key}/translate`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: payload,
    });

    if (response.response.statusCode !== 200) {
      return "请求失败";
    }

    return JSON.parse(response.data).data;
  } catch (error) {
    $log(error);
    return null;
  }
}
