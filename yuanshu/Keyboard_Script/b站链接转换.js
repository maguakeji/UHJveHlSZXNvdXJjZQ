// author: 叙白
// name: b站链接转换.js
// date: 2025-04-17
// 使用： 复制b站app分享的链接后，运行脚本会自动提取b23的短链，转换为只含bv号的长链
async function output() {
	var text = $searchText || $pasteboardContent;
	const url = await extractBiliUrls(text);
	$log(url);
	const response = await $http({
		url: `${url}`,
		method: "HEAD"
	});
	const longUrl= response.response.url;
	const shortUrl = longUrl.split('?')[0];
	return shortUrl;
}

function extractBiliUrls(text) {
    // 优先匹配B站短链接格式（b23.tv）
    const biliShortRegex = /https?:\/\/b23\.tv\/[a-zA-Z0-9]+/g;
    const urls = text.match(biliShortRegex) || [];
    
    // 补充匹配标准URL
    const standardUrls = text.match(/https?:\/\/[^\s]+/g) || [];
    return [...new Set([...urls, ...standardUrls])]; // 去重
}
