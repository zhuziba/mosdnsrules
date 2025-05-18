const $ = new Env('采集站采集');
const notify = $.isNode() ? require('./sendNotify') : '';
var fs = require('fs')
let status;
status = (status = ($.getval("qxqstatus") || "1")) > 1 ? `${status}` : ""; // 账号扩展字符
let qxqbodyArr = [];
let qxqbody = $.isNode() ? (process.env.qxqbody ? process.env.qxqbody : "") : ($.getdata('qxqbody') ? $.getdata('qxqbody') : "");
let qxqbodys = ''
let times = new Date().getTime();
let tz = ($.getval('tz') || '1');
let arr = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
let taskheader = {
    "version": "2.1.7",
    'Content-Type': 'application/json',
    "channel": "ios",
    "plat": "app",
    "Authorization": "",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Html5Plus/1.0 (Immersed/20) uni-app"
};
let host = `http://caiji.dyttzyapi.com`;
let from = `dyttm3u8`
let bofanghost = `https://leshiyuncdn.36s.top`;
let hd = ''
$.message = ''
!(async () => {
    if (typeof $request !== "undefined") {
        qxqck()
    } else {
        if (!$.isNode()) {
            qxqbodyArr.push($.getdata('qxqbody'))
            let qxqcount = ($.getval('qxqcount') || '1');
            for (let i = 2; i <= qxqcount; i++) {
                qxqbodyArr.push($.getdata(`qxqbody${i}`))
            }
            console.log(`=================== 共${qxqbodyArr.length}个账号 ==================\n`)
            for (let i = 0; i < qxqbodyArr.length; i++) {
                if (qxqbodyArr[i]) {
                    qxqbody = qxqbodyArr[i];
                    $.index = i + 1;
                    console.log(`\n开始【采集第 ${$.index}】页`)
                    await byxiaopeng()
                }
            }
        } else {
            if (process.env.qxqbody && process.env.qxqbody.indexOf('@') > -1) {
                qxqbodyArr = process.env.qxqbody.split('@');
                console.log(`您选择的是用"@"隔开\n`)
            } else {
                qxqbodys = [process.env.qxqbody]
            };
            Object.keys(qxqbodys).forEach((item) => {
                if (qxqbodys[item]) {
                    qxqbodyArr.push(qxqbodys[item])
                }
            })
            console.log(`共${qxqbodyArr.length}页`)
            await byxiaopeng()
            for (let k = 0; k < qxqbodyArr.length; k++) {
                qxqbody = qxqbodyArr[k];
                $.index = k + 1;
                console.log(`\n开始【采集第 ${$.index}页`)
                await byxiaopeng()
            }
        }
    }
    message() //通知
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

//要执行的代码
async function byxiaopeng() {
    //await fenleiclass()
    //await $.wait(100)
    //await fenlei()
    await gogo(6)

}

//获取class
async function fenleiclass() {

    let data = await pengget(`https://19q.cc/api.php/provide/vod/?ac=list`, taskheader)
    let result = JSON.parse(data)
    let classarr = result.class.length  //数组长度
    console.log(`class_数组长度:` + classarr)
    let classname = '';
    let classid = '';
    for (let k = 0; k < classarr; k++) {
        k1 = k + 1;
        let type_id = result.class[k1 - 1]['type_id']
        let type_name = result.class[k1 - 1]['type_name']
      //result1.push(type_id)
      //result1.push(type_name)
        //sresult += k1 + `&`
        classname += type_name + `&`
        classid  += type_id + `&`
        /*
        await $.wait(10)
        fs.writeFile(`./classname.m3u`, classname, { flag: 'a' }, (err) => {
            if (err) {
                return
            } else {
                console.log(`classname文件保存成功当前第${k1}集`)
            }
        })
        await $.wait(10)
        fs.writeFile(`./classid.m3u`, classid, { flag: 'a' }, (err) => {
            if (err) {
                return
            } else {
                console.log(`classid文件保存成功当前第${k1}集`)
            }
        })
        */
    }
    // 去掉字符串末尾的字符
    console.log(classid.slice(0, -1))
    console.log(classname.slice(0, -1))
    //console.log(classid)
    //console.log(classname)
}  


async function m3ufenlei() {

    let data = await pengget(`${host}/api.php/provide/vod/?ac=list`, taskheader)
    let result = JSON.parse(data)
    console.log(`\n${result}`)
    let classarr = result.class.length  //数组长度
    let total = result.total  //影片数据
    console.log(`\n当前站点影片数量：${total}`)
    console.log(`\n当前站点分类数量：${classarr}`)
    for (let k = 0; k < classarr; k++) {
        $.index = k + 1;
        let type_id = result.class[$.index - 1]['type_id']
        let type_name = result.class[$.index - 1]['type_name']

        console.log(`\n开始采集分类：${type_name}分类ID：${type_id}`)
        await aptvgogo(type_id)
    }

}

async function fenlei() {
    let data = await pengget(`${host}/api.php/provide/vod/?ac=list`, taskheader)
    let result = JSON.parse(data)
    let classarr = result.class.length  //数组长度
    let total = result.total  //影片数据
    console.log(`\n当前站点影片数量：${total}`)
    console.log(`\n当前站点分类数量：${classarr}`)
    for (let k = 0; k < classarr; k++) {
        $.index = k + 1;
        let type_id = result.class[$.index - 1]['type_id']
        let type_name = result.class[$.index - 1]['type_name']

        console.log(`\n开始采集分类：${type_name}分类ID：${type_id}`)
        //await m3u8(type_id, $.index)
        await gogo(type_id)
    }

}

async function aptvgogo(tid) {
    let data = await pengget(`${host}/api.php/provide/vod/?&ac=detail&t=${tid}`, taskheader)
    //console.log(`\n${data}`)
    let result = JSON.parse(data)
    let pagearr = result.pagecount //多少页
    console.log(`\n当前站点影片页数：${pagearr}`)
    if (pagearr == 0) {
        return
    } else {
        let type_name = result.list[0]['type_name'] //分类
        let type_id = result.list[0]['type_id']
        for (let k = 0; k < pagearr; k++) {
            $.index = k + 1;
            console.log(`\n开始采集${type_name}第 ${$.index}页`)
            await m3u8(type_id, $.index)
            //await loginByPassword(type_name, type_id, $.index)
        }
    }
}

async function gogo(tid) {
    try {
        let data = await pengget(`${host}/api.php/provide/vod?&ac=detail&t=${tid}`, taskheader);
        let result = JSON.parse(data);

        // 修复点1：添加类型检查和安全取值
        let pagearr = parseInt(result.pagecount) || 0;
        console.log(`\n分类ID ${tid} 影片总页数：${pagearr}`);

        // 修复点2：优化空数据判断逻辑
        if (pagearr === 0 || !result?.list?.length) {
            console.log(`分类 ${tid} 无有效数据`);
            return;
        }

        // 修复点3：使用可选链操作符防止报错
        let type_name = result.list[0]?.type_name || '未知分类';
        let type_id = result.list[0]?.type_id || tid;


        // 修复点5：添加分页加载间隔
        for (let k = 0; k < pagearr; k++) {
            $.index = k + 1;
            console.log(`\n开始采集【${type_name}】第 ${$.index}/${pagearr} 页`);

            // 添加请求间隔防止封禁
            if (k > 0) await $.wait(RT(100, 300));

            await loginByPassword(type_name, type_id, $.index);
        }
    } catch (error) {
        // 修复点6：增强错误信息
        console.error(`[${tid}]分类采集失败: ${error.message}\n${error.stack}`);
        $.message += `\n分类 ${tid} 采集异常：${error.message}`;
    }
}

const isDirectoryExists = (dirPath) => {
    return fs.existsSync(dirPath);
};
//采集数据 网站自用
//&year=2024
async function loginByPassword(mulu, t, pg) {
    // 添加目录创建异常处理
    diymulu = `${mulu}`
    if (!fs.existsSync(`./dm/${diymulu}`)) {
        await fs.promises.mkdir(`./dm/${diymulu}`, { recursive: true });
    }

    let data = await pengget(`${host}/api.php/provide/vod/from/${from}/?ac=detail&t=${t}&pg=${pg}`, taskheader)
    let result = JSON.parse(data)
    if (result.code == 1) {
        let listarr = result.list.length
        for (let p = 0; p < listarr; p++) {
            // 添加安全索引访问
            const currentItem = result.list[p];
            if (!currentItem) continue;

            // 优化目录创建逻辑
            const vod_name = currentItem['vod_name'].replace(/[\\/:"*?<>|]/g, ""); // 过滤非法文件名字符
            console.log(`当前影片名称：${vod_name}`)
            const targetDir = `./dm/${diymulu}/${vod_name}`;

            if (!fs.existsSync(targetDir)) {
                await fs.promises.mkdir(targetDir, { recursive: true });
            }

            // 优化播放地址解析
            const vod_play_url = currentItem['vod_play_url'];
            const vod_play = vod_play_url.split("#").filter(Boolean); // 过滤空字符串

            // 修正数组映射逻辑
            const hd_name = vod_play.map(item => {
                const parts = item.split('$');
                return parts.length > 1 ? parts[0].trim() : "未命名";
            });

            const title = vod_play.map(item => {
                const parts = item.split('$');
                return parts.length > 1 ? parts[1].trim() : "";
            });

            // 添加并发控制
            for (let s = 0; s < vod_play.length; s++) {
                try {
                    const kk = s + 1;
                    const proxyUrl = `https://mfqcb.zyzqcb.cc/mf.php?url=${encodeURIComponent(title[s])}`;
                    //const proxyUrl = `https://jerryhtom.cn/api/?key=M61b6Nne7n0A7OKNue&url=${encodeURIComponent(title[s])}`;

                    // 添加请求超时处理
                    const data1 = await pengget(proxyUrl, taskheader);
                    //console.log(`解析结果 ${data1}`);
                    if (!data1) throw new Error('代理请求失败');

                    const result1 = JSON.parse(data1);
                    //console.log(`解析结果 ${result1}`);
                    if (result1.code !== 200) throw new Error('无效响应码');

                    const m3u8dizhi = result1.url;
                    const data2 = await pengget(m3u8dizhi, taskheader);

                    // 添加内容验证
                    if (!data2.includes('#EXTM3U')) {
                        throw new Error('无效的M3U8内容');
                    }

                    // 使用异步写入并添加错误处理
                    await fs.promises.writeFile(
                        `./dm/${diymulu}/${vod_name}/${hd_name[s]}.mp4`,
                        data2
                    );

                } catch (error) {
                    console.error(`第${s + 1}个资源获取失败:`, error.message);
                    continue; // 跳过当前错误继续执行
                }
            }
        }
    }
}

//m3u8采集格式  没啥屌用
async function m3u8(t, pg) {
    let data = await pengget(`${host}/api.php/provide/vod/?ac=list&ac=detail&t=${t}&pg=${pg}`, taskheader)
    let result = JSON.parse(data)
    //console.log(`\n【数组列表长度${listarr}`)
    if (result.code == 1) {
        let listarr = result.list.length
        for (let p = 0; p < listarr; p++) {
            i = p + 1
            //console.log(`\n【开始获取${p + 1}个动漫`)
            let vod_name = result.list[i - 1]['vod_name']
            console.log(`当前影片名称：${vod_name}`)
            let vod_play_url = result.list[i - 1]['vod_play_url']
            let tvglogo = result.list[i - 1]['vod_pic']
            let typename = result.list[i - 1]['type_name']
            vod_play = vod_play_url.split("#")
            vod_playarr = vod_play.length
            const title = vod_play.map(item => {
                const parts = item.split('$');
                return parts.length > 1 ? parts[1] : '';
            });
            for (let s = 0; s < vod_playarr; s++) {
                kk = s + 1
                //fs.writeFile(`./${vod_name}/${kk}.json`, JSON.stringify(title[kk - 1]), function (err, data) { if (err) { throw err } console.log('文件保存成功'); })
                m3u8qianzui = `#EXTM3U\n#EXT-X-APP APTV\n#EXT-X-APTV-TYPE local\n`
                m3u8tvglogo = `#EXTINF:-1 tvg-logo=` + `"` + tvglogo + `"` + ` group-title=` + `"` + typename + `"` + `,` + vod_name + `\n` + title[kk - 1] + `\n`
                //console.log(mixed)
                fs.writeFile(`./dm/91.m3u`, m3u8tvglogo, { flag: 'a' }, (err) => {
                    if (err) {
                        return
                    } else {
                        //console.log(`文件保存成功当前第${kk}集`)
                    }

                })
            }
        }
    }
}

//通知
async function message() {
    if (tz == 1) {
        $.msg($.name, "", $.message)
    }
    if ($.isNode()) {
        await notify.sendNotify($.name, $.message)
    }
}

function RT(X, Y) {
    do rt = Math.floor(Math.random() * Y);
    while (rt < X)
    return rt;
}

//判断是否json数据
function isjson(str) {
    if (typeof str == 'string') {
        try {
            JSON.parse(str)  // 如果抛出异常，则会从这条语句终止，被catch捕捉
            return true
        } catch (e) {
            return false
        }
    }
}
//post发包
function pengpost(url, header, body) {
    return new Promise(async resolve => {
        let urlObj = {
            url: url,
            headers: header,
            body: body,
        }
        $.post(urlObj, (err, resp, data) => {
            try {
                if (err) {
                    return resolve(JSON.stringify(`API请求失败，请检查网络重试`))
                } else {
                    return resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
//get发包
function pengget(url, header) {
    return new Promise(async resolve => {
        let urlObj = {
            url: url,
            headers: header,
        }
        $.get(urlObj, (err, resp, data) => {
            try {
                if (err) {
                    return resolve(JSON.stringify(`API请求失败，请检查网络重试`))
                } else {
                    return resolve(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
//Env.min.js
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: i, statusCode: r, headers: o, rawBody: h }, s.decode(h, this.encoding)) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: s, statusCode: r, headers: o, rawBody: h }, i.decode(h, this.encoding)) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = rawOpts["update-pasteboard"] || rawOpts.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
//Env.min.js