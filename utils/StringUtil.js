exports.NormalizeName = (name, padding = 3) => {
    name = name.replace(/.mp3|.ogg|.wave/ig, '');
    var res1 = name.split(/\d+/g);
    if (res1.length === 1) return name;
    var res2 = name.match(/\d+/g);
    var temp = "";
    if (res1 !== null && res2 !== null) {
        for (let [i, s] of res2.entries()) {
            temp += res1[i] + String(Number(s)).padStart(padding, 0);
        }
        temp = temp + res1[res1.length - 1];
    }
    return temp;
}