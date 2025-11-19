// author: 叙白
// name: 谷歌中英互译.js
// date: 2024-09-27

async function googleTranslate(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=auto&dt=t&q=${encodeURIComponent(text)}`;
		// 第一次调用 googleTranslate 函数，检测并翻译文本
    const resp = await $http({
      url,
      header: {"Content-Type": "application/json"}
      });

    if (resp.response.statusCode !== 200) {
      return "翻译失败";
    }

    const jsonDict = JSON.parse(resp.data);
    const detectedLang = jsonDict[2]; // 这个字段包含检测到的源语言

    // 根据检测到的源语言决定目标语言
    let targetLang = detectedLang === "zh-CN" ? "en" : "zh-CN";

    // 进行第二次翻译，这次使用目标语言
    const urlWithTarget = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${detectedLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const respWithTarget = await $http({
      url: urlWithTarget,
      header: {
        "Content-Type": "application/json",
      }
    });

    if (respWithTarget.response.statusCode !== 200) {
      return "翻译失败";
    }

    const translatedText = JSON.parse(respWithTarget.data)[0].map(item => item[0]).join('');
    return translatedText;

  } catch (error) {
    $log(error);
    return "翻译过程中出现错误";
  }
}

async function output() {
  var text = $searchText || $pasteboardContent || "你好";
  if (!text) {
    return "请输入要翻译的文本";
  }
  
  const translatedText = await googleTranslate(text);
  return translatedText;
}
