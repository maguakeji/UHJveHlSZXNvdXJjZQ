// name: 骂人.js

async function getInsultText(text) {
    try {
        const url = "https://api.oddfar.com/yl/q.php?c=1009&encode=text";


        const resp = await $http({
            url,
            method: 'GET',
            header: { "Content-Type": "application/json" }
        });

        // 检查响应是否成功
        if (resp.response.statusCode !== 200) {
            throw new Error(`HTTP error! status: ${resp.response.statusCode}`);
        }

        return resp.data;
    } catch (error) {
        console.error("Translation error:", error);
        return null; // 处理错误的返回值
    }
}

// 示例调用
async function output() {

    const result = await getInsultText();
    return result;
};
