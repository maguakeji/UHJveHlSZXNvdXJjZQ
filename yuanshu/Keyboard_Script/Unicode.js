// author: 叙白
// name: Unicode.js
// date: 2024-09-26

async function getUnicodeWithCharacter(str) {
    let unicodeArray = [];
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        let codePoint = str.codePointAt(i);
        
        // Skip the next code unit if this character is a high surrogate
        if (codePoint > 0xFFFF) {
            i++;
        }
        
        let unicode = char + ': U+' + codePoint.toString(16).toUpperCase();
        unicodeArray.push(unicode);
    }
    return unicodeArray.join('\n');
}

async function output() {
  const text = $searchText || $pasteboardContent; 
  const result = await getUnicodeWithCharacter(text);
  return result;
}
