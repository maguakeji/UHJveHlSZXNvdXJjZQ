// 1. 将你的 DeepLX API 地址完整地粘贴到这里
const DEEPLX_API_URL = "";

/**
 * 主函数，脚本的入口
 * 获取选中文本或剪贴板内容，并调用翻译函数
 */
async function output() {
    // 优先使用选中的文本，其次使用剪贴板内容
    var text = $searchText || $pasteboardContent;
    if (!text || text.trim() === "") {
        $log("输入文本为空，翻译任务取消。");
        return "";
    }
    return await deepLXTranslate(text);
}

/**
 * 调用 DeepLX API 进行翻译
 * @param {string} text - 需要翻译的文本
 * @returns {Promise<string>} - 翻译后的文本
 */
async function deepLXTranslate(text) {
    // 2. 自动检测语言并设置目标语言
    //    - 如果输入包含中文字符，则目标语言为英语 (EN)
    //    - 否则，目标语言为中文 (ZH)
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    const targetLang = hasChinese ? "EN" : "ZH";

    try {
        const response = await $http({
            url: DEEPLX_API_URL,
            method: "POST",
            header: {
                "Content-Type": "application/json",
            },
            // 3. 构建符合 DeepLX API 要求的请求体
            body: {
                text: text,
                source_lang: "auto", // 源语言自动检测
                target_lang: targetLang,
            },
            timeout: 30, // 设置30秒超时
        });

        // 检查 HTTP 状态码
        if (response.response.statusCode !== 200) {
            throw new Error(`API请求失败: HTTP状态码 ${response.response.statusCode}`);
        }

        // 解析返回的 JSON 数据
        const responseData = JSON.parse(response.data);

        // 检查 DeepLX 返回的业务状态码
        if (responseData.code !== 200 || !responseData.data) {
            throw new Error(`API返回错误: ${responseData.message || '未知错误'}`);
        }

        // 4. 返回翻译结果
        return responseData.data;

    } catch (error) {
        // 统一处理所有错误
        const errorMessage =
            error instanceof SyntaxError
                ? "API返回的数据无法解析为JSON"
                : error.message || "未知错误";

        $log(`DeepLX API 错误: ${errorMessage}`); // 在输入法后台记录日志，方便排查
        if (error.response) {
            $log(`响应详情: ${JSON.stringify(error.response)}`);
        }

        // 向用户显示友好的错误提示
        return `翻译失败: ${errorMessage}`;
    }
}
