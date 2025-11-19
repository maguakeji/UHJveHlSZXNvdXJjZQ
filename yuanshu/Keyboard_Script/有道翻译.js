// by leepyer
// 叙白修改适配仓输入法
async function output() {
  try {
    var text = $searchText || $pasteboardContent;
    if (!text) {
      return "请输入要翻译的文本";
    }
    const url = "https://m.youdao.com/translate";
    const params = {
      "inputtext": text,
      "type": "auto"
    };
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://m.youdao.com/translate"
    };
    const resp = await $http({
      url,
      method: "POST",
      body: params,
      header: headers
    });
    const regex = /<ul id="translateResult">[\s\S]*?<\/ul>/;
    let match = resp.data.match(regex);
    let result = match ? match[0] : null;
    const reg = /(?<=<li>).*(?=<\/li>)/;
    // const reg = /<li>(.*?)<\/li>/;
    const m = result.match(reg);
    const res = m ? m[0] : null;
    // const res = m ? m[1] : null;
    return res;
  } catch (error) {
    $log(error);
    return null;
  }
}
