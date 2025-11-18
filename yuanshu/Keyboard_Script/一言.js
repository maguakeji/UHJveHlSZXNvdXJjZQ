// 一言（Hitokoto）脚本
// ========================

const HITOKOTO_URL = 'https://v1.hitokoto.cn/?c=d&c=h&c=i&c=j';

/**
 * 从一言 API 获取随机句子
 */
async function getHitokoto() {
    try {
        // 使用环境提供的 $http 发起 GET 请求
        const resp = await $http({
            url: HITOKOTO_URL,
            method: "GET",
            // 超时时间
            timeout: 10 
        });

        if (resp.response.statusCode !== 200) {
            throw new Error(`HTTP状态码 ${resp.response.statusCode}`);
        }

        const data = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
        
        // 提取数据
        const hitokoto = data.hitokoto || '加载失败';
        const from = data.from || '未知出处';
        // 处理作者信息
        const from_who = data.from_who === null || data.from_who === '' ? '佚名' : data.from_who;

        // 构建输出文本，与您 DeepSeek 脚本的格式类似，使用换行符分隔
        return `"${hitokoto}"\n—— ${from_who} / ${from}`;

    } catch (err) {
        // 使用环境提供的 $log 记录错误
        $log(`❌ 一言查询错误: ${err.message || err}`);
        return `一言获取失败：${err.message || "未知错误"}`;
    }
}

/**
 * 主函数
 */
async function output() {
    // 因为这个脚本是随机获取一句话，所以不需要 $searchText 或 $pasteboardContent
    return await getHitokoto();
}
