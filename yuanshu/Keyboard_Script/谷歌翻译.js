// author: 叙白
// name: 谷歌翻译.js
// date: 2024-09-25
// 使用： 要翻译成英文或中文，在翻译文本前加“中/英”， 例： 中我要回家，将会翻译成英文 

async function googleTranslate(target, text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await $http({
      url,
      header: {
        "Content-Type": "application/json",
      }
    });

    if (resp.response.statusCode!== 200) {
      return "翻译失败";
    }
    const jsonDict = JSON.parse(resp.data);
    const translatedText = jsonDict[0].map(item => item[0]).join('');
    return translatedText;

  } catch (error) {
    $log(error);
  }
}

async function output() {
  var text = $searchText || $pasteboardContent || "d l";
  if (!text) {
    return "请输入要翻译的文本";
  }
  let target = "";
  const languageMap = {
    "中": "zh-CN",
    "英": "en",
    "韩": "ko",
    "日": "ja"
    // 添加更多语言映射
  };
  target = languageMap[text[0]] || "zh";
  text = text.slice(1);
  const translatedText = await googleTranslate(target, text);
  return translatedText;
}
