// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://shimo.im/docs/QhJd3dKVvWh9Cx9W
// @description:zh    https://shimo.im/docs/QhJd3dKVvWh9Cx9W
// @description:zh-CN https://shimo.im/docs/QhJd3dKVvWh9Cx9W
// @version           0.44
// @author            fyy99
// @match             *://ngabbs.com/*
// @match             *://bbs.nga.cn/*
// @match             *://nga.178.com/*
// @run-at            document-end
// @note              v0.25 Beta1
// @note              v0.26 优化：支持/反对、刷新检测机制
// @note              v0.27 新增：“连续翻页”按钮
// @note              v0.28 修复：同步机型显示的变化
// @note              v0.30 新增：新增回帖批量次级NUKE
// @note              v0.35 优化：弱化赞踩显示；新增：设置面板；新增：个人声望查询
// @note              v0.38 新增：回帖批量操作可以选择不延时
// @note              v0.39 新增：主题批量提前/下沉
// @note              v0.40 修复：解决连续进行同种回帖批量操作不生效的问题
// @note              v0.42 新增：提供两种标注楼主的风格
// @note              v0.43 优化：方型标记支持点击仅查看楼主，优化[标注楼主]的设置面板
// @note              v0.44 细节优化
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    window = unsafeWindow;

    // 读取设置
    const nga_wd_helper_jump = GM_getValue('nga_wd_helper_jump', 0);
    const nga_wd_helper_offs = GM_getValue('nga_wd_helper_offs', 0);
    const nga_wd_helper_reputation = GM_getValue('nga_wd_helper_reputation', '[7@网事杂谈]\n[447601@二次元国家地理]');

    // 跳转
    const nga_wd_helper_jump_target = nga_wd_helper_jump == 2 ? 'nga.178.com' : nga_wd_helper_jump == 1 ? 'bbs.nga.cn' : 'ngabbs.com';
    if (!document.location.href.includes(nga_wd_helper_jump_target)) {
        document.location.href = document.location.href.replace('ngabbs.com', nga_wd_helper_jump_target).replace('bbs.nga.cn', nga_wd_helper_jump_target).replace('nga.178.com', nga_wd_helper_jump_target);
    }

    // 设置中心
    window.commonui && window.commonui.mainMenu && window.commonui.mainMenu.addItemOnTheFly('WD插件', null, () => {
        const setting_window = window.commonui.createCommmonWindow(4);
        const $ = window._$;
        let setting_html = `
<style>input#offs8:not(:checked)~span#nga_wd_helper_marklz_span{visibility:hidden;}</style>
如有疑问，请前往阅读<a class="orangered" style="font-weight:bold" href="https://shimo.im/docs/QhJd3dKVvWh9Cx9W" target="_blank">[帮助文档]</a><br><br>
自动跳转到<br>
<span class="silver">该功能无法关闭，但您可以选择一个喜欢的域名</span><br>
<table><tbody><tr><td><input type="radio" name="jump" value="0">ngabbs.com</td><td><input type="radio" name="jump" value="1">bbs.nga.cn</td><td><input type="radio" name="jump" value="2">nga.178.com</td></tr></tbody></table><br>
功能开关<br>
<span class="silver">星号表示仅任区内生效</span><br>
<input type="checkbox" checked disabled title="该功能无法关闭">启用[批量操作]*<br>
<input type="checkbox" name="offs" id="offs1" value="1"><label for="offs1">启用[显示赞踩]*</label><br>
<input type="checkbox" name="offs" id="offs2" value="2"><label for="offs2">启用[显示机型]*</label><br>
<input type="checkbox" name="offs" id="offs16" value="16"><label for="offs16">启用[连续翻页]</label><br>
<input type="checkbox" name="offs" id="offs4" value="4"><label for="offs4">启用[标注样式]</label><br>
<input type="checkbox" name="offs" id="offs8" value="8"><label for="offs8">启用[标注楼主]</label><br>
<span id="nga_wd_helper_marklz_span">&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="marklz" id="offs32" value="32"><label for="offs32">★型</label>&nbsp;&nbsp;<input type="radio" name="marklz" id="offs32a"><label for="offs32a">方型</label></span><br><br>
显示用户声望<br>
<span class="silver">将用户声望显示到用户中心</span><br>
<span class="silver">[用户ID@版块名]，每行一个</span><br>
<textarea name="reputation" placeholder="例如：\n[7@网事杂谈]\n[447601@二次元国家地理]" rows="4" cols="20"></textarea><br><br>
<button name="setting_confirm" type="button">确定</button><br><br>`;
        setting_window._.addContent(setting_html);
        setting_window._.addTitle('[NGA版主助手]设置面板');
        setting_window._.show();
        document.querySelector(`input[type=radio][name=jump][value='${nga_wd_helper_jump}']`).checked = true;
        document.querySelector("input[type=checkbox][name=offs][value='1']").checked = !(nga_wd_helper_offs & 1);
        document.querySelector("input[type=checkbox][name=offs][value='2']").checked = !(nga_wd_helper_offs & 2);
        document.querySelector("input[type=checkbox][name=offs][value='4']").checked = !(nga_wd_helper_offs & 4);
        document.querySelector("input[type=checkbox][name=offs][value='8']").checked = !(nga_wd_helper_offs & 8);
        document.querySelector("input[type=checkbox][name=offs][value='16']").checked = !(nga_wd_helper_offs & 16);
        document.querySelector("input#offs32").checked = !(nga_wd_helper_offs & 32);
        document.querySelector("input#offs32a").checked = (nga_wd_helper_offs & 32);
        document.querySelector("textarea[name=reputation]").value = nga_wd_helper_reputation;
        document.querySelector("button[type=button][name=setting_confirm]").addEventListener('click', () => {
            GM_setValue('nga_wd_helper_jump', document.querySelector("input[type=radio][name=jump]:checked").value);
            let offs = 0;
            document.querySelectorAll("input[type=checkbox][name=offs]:not(:checked)").forEach(i => {
                offs |= i.value;
            });
            if (document.querySelector("input#offs32a").checked) {
                offs |= 32;
            }
            GM_setValue('nga_wd_helper_offs', offs);
            GM_setValue('nga_wd_helper_reputation', document.querySelector("textarea[name=reputation]").value);
            location.reload();
        });
    });

    // 定时检测刷新
    setInterval(function () {
        const href = document.location.href;
        if (document.nga_wd_helper_url == href) {
            return;
        }
        document.nga_wd_helper_url = href;
        setTimeout(() => {
            if (document.location.href != href) {
                return;
            }

            if (document.location.href.includes('/read.php')) {
                // 批量操作(加分) 批量操作(属性)
                if (window.__GP.admincheck & 2 && !document.querySelector('#nga_wd_helper_pids_add')) {
                    // class/style
                    const nga_wd_helper_style = document.createElement('style');
                    nga_wd_helper_style.type = 'text/css';
                    nga_wd_helper_style.innerHTML = "span[id^=postdate][class*=stxt]{font-weight:bold;cursor:pointer;} span[id^=postdate][class*=stxt][style*=darkred]{color:orangered !important;text-decoration:underline;} span[id^=postdate][class*=stxt][style*=darkred]:before{content:'\\2714  '}";
                    document.head.appendChild(nga_wd_helper_style);
                    // select
                    const getSelectedPids = (tid = false) => {
                        const pids = document.querySelectorAll('span[id^=postdate][class*=stxt][style*=darkred]');
                        const ids = [];
                        for (let pid of pids) {
                            if (pid.parentNode && pid.parentNode.parentNode && pid.parentNode.parentNode.firstChild && pid.parentNode.parentNode.firstChild.id.startsWith('pid')) {
                                const pid_regexp = new RegExp('pid([0-9]+)Anchor').exec(pid.parentNode.parentNode.firstChild.id);
                                if (pid_regexp && pid_regexp[1]) {
                                    if (tid) {
                                        ids.push(tid);
                                    }
                                    ids.push(pid_regexp[1]);
                                }
                            }
                        }
                        return ids;
                    };
                    // #nga_wd_helper_pids_bar
                    const pids_bar = document.createElement('div');
                    pids_bar.id = 'nga_wd_helper_pids_bar';
                    pids_bar.className = 'right_';
                    pids_bar.innerHTML = '<table class="stdbtn" cellspacing="0"><tbody><tr></tr></tbody></table>';
                    const postbbtm = document.querySelector('#postbbtm');
                    postbbtm.style.clear = 'both';
                    postbbtm.parentNode.insertBefore(pids_bar, postbbtm);
                    // 全选
                    const td_pids_all = document.createElement('td');
                    td_pids_all.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="选中当前显示的所有帖子">全选</a>';
                    td_pids_all.addEventListener('click', () => {
                        for (let span of document.querySelectorAll('span[id^=postdate][class*=stxt]:not([style*=darkred])')) {
                            const e0 = document.createEvent('MouseEvents');
                            e0.initEvent('click', true, true);
                            span.dispatchEvent(e0);
                        }
                    });
                    pids_bar.querySelector('tr').appendChild(td_pids_all);
                    // 反选
                    const td_pids_inv = document.createElement('td');
                    td_pids_inv.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="反选当前显示的所有帖子">反选</a>';
                    td_pids_inv.addEventListener('click', () => {
                        for (let span of document.querySelectorAll('span[id^=postdate][class*=stxt]')) {
                            const e0 = document.createEvent('MouseEvents');
                            e0.initEvent('click', true, true);
                            span.dispatchEvent(e0);
                        }
                    });
                    pids_bar.querySelector('tr').appendChild(td_pids_inv);
                    // #nga_wd_helper_pids_add
                    const td_pids_add = document.createElement('td');
                    td_pids_add.id = 'nga_wd_helper_pids_add';
                    td_pids_add.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="帖子批量评分">评分</a>';
                    td_pids_add.addEventListener('click', () => {
                        const fid = window.__CURRENT_FID;
                        const tid = window.__CURRENT_TID;
                        window.adminui.addpoint(null, 1, 1, fid);
                        const w = document.querySelector('#adminwindow');
                        w._.addTitle('评分(批量)');
                        const new_button = document.createElement('button');
                        new_button.type = 'button';
                        new_button.innerHTML = '确定(脚本批量)';
                        new_button.addEventListener('click', () => {
                            const pids = getSelectedPids();
                            if (pids.length == 0) {
                                alert('没有任何有效的选中项目');
                                return;
                            }
                            if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let x = w.querySelectorAll('#adminwindow > div > div.div2 > div input');
                                let opt = 0;
                                for (let i = 0; i < x.length; i++) {
                                    if (!x[i].disabled) {
                                        if (x[i].checked) opt |= x[i].value;
                                        else if (x[i]._negvalue) opt |= x[i]._negvalue;
                                    }
                                }
                                const info = w.querySelector('input[type=text][placeholder=加分说明]').value;
                                const value = w.querySelector('input[placeholder="声望-1500~1500"]').value;
                                window.commonui.userCache.set('lastTipOpt', opt, 86400 * 30);
                                window.commonui.userCache.set('lastTipInfo', info, 86400 * 30);
                                window.commonui.userCache.set('lastTipAmt', value, 86400 * 30);
                                let results = '';
                                const mas = function (pids) {
                                    if (pids.length) {
                                        const pid = pids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'add_point_v3', __act: 'add', opt: opt, fid: fid, tid: tid, pid: pid, info: info, value: value, raw: 3, nga_wd_helper_pids_add: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `pid:${pid} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(pids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(pids);
                            }
                        });
                        for (let old_button of w.querySelectorAll('button[type=button]')) {
                            if (old_button.innerHTML != '确定') {
                                continue;
                            }
                            old_button.parentNode.insertBefore(new_button, old_button);
                            old_button.parentNode.removeChild(old_button);
                            break;
                        }
                    });
                    pids_bar.querySelector('tr').appendChild(td_pids_add);
                    // #nga_wd_helper_pids_del
                    const td_pids_del = document.createElement('td');
                    td_pids_del.id = 'nga_wd_helper_pids_del';
                    td_pids_del.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量设置帖子属性">属性</a>';
                    td_pids_del.addEventListener('click', () => {
                        const fid = window.__CURRENT_FID;
                        const tid = window.__CURRENT_TID;
                        window.commonui.setPost(null, 1, 1, null);
                        const w = document.querySelector('#commonuiwindow');
                        w._.addTitle('设置帖子属性(批量)');
                        const new_button = document.createElement('button');
                        new_button.type = 'button';
                        new_button.innerHTML = '确定(脚本批量-非延时)';
                        new_button.addEventListener('click', () => {
                            const ids = getSelectedPids(tid);
                            if (ids.length == 0) {
                                alert('没有任何有效的选中项目');
                                return;
                            }
                            if (confirm('即将进入批量操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let pOn = 0;
                                let pOff = 0;
                                let x = w.querySelectorAll('div.div2 > div > form > div a');
                                for (let i = 0; i < x.length; i++) {
                                    if (x[i].innerHTML == 'on') {
                                        pOn |= parseInt(x[i].name, 10);
                                    } else if (x[i].innerHTML == 'off') {
                                        pOff |= parseInt(x[i].name, 10);
                                    }
                                }
                                if (pOn & 32768) {
                                    // ???
                                    if (!confirm('转为合集后不能转回 是否继续')) {
                                        return;
                                    }
                                }
                                if (!pOn && !pOff) {
                                    return;
                                }
                                const pm = w.querySelector('input[type=checkbox][name=pm]').checked ? 1 : '';
                                const info = w.querySelector('textarea[name=info]').value.replace(/^\s+|\s+$/, '');
                                const de = w.querySelector('select[name=delay]').value;
                                let results = '';
                                const mas = function (ids) {
                                    if (ids.length) {
                                        const ids_i = ids.shift();
                                        const ids_i2 = ids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'topic_lock', __act: 'set', ids: `${ids_i},${ids_i2}`, ton: 0, toff: 0, pon: pOn, poff: pOff, pm: pm, info: info, delay: de, cfid: fid, raw: 3, nga_wd_helper_pids_del: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `id:${ids_i} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(ids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(ids);
                            }
                        });
                        const new_button2 = document.createElement('button');
                        new_button2.type = 'button';
                        new_button2.innerHTML = '确定(脚本批量-延时生效)';
                        new_button2.addEventListener('click', () => {
                            const ids = getSelectedPids(tid);
                            if (ids.length == 0) {
                                alert('没有任何有效的选中项目');
                                return;
                            }
                            if (confirm('即将进入批量操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let pOn = 0;
                                let pOff = 0;
                                let x = w.querySelectorAll('div.div2 > div > form > div a');
                                for (let i = 0; i < x.length; i++) {
                                    if (x[i].innerHTML == 'on') {
                                        pOn |= parseInt(x[i].name, 10);
                                    } else if (x[i].innerHTML == 'off') {
                                        pOff |= parseInt(x[i].name, 10);
                                    }
                                }
                                if (pOn & 32768) {
                                    // ???
                                    if (!confirm('转为合集后不能转回 是否继续')) {
                                        return;
                                    }
                                }
                                if (!pOn && !pOff) {
                                    return;
                                }
                                const pm = w.querySelector('input[type=checkbox][name=pm]').checked ? 1 : '';
                                const info = w.querySelector('textarea[name=info]').value.replace(/^\s+|\s+$/, '');
                                const de = w.querySelector('select[name=delay]').value;
                                window.__NUKE.doRequest({
                                    u: { u: window.__API._base, a: { __lib: 'topic_lock', __act: 'set', ids: ids.join(','), ton: 0, toff: 0, pon: pOn, poff: pOff, pm: pm, info: info, delay: de, cfid: fid, raw: 3, nga_wd_helper_pids_del: 1 } },
                                    f: function (d) {
                                        if (d && !d.error && d.data) {
                                            let result = '批量操作完成\n\n';
                                            for (let i in d.error) {
                                                result += d.error[i] + '\n';
                                            }
                                            for (let i in d.data) {
                                                result += d.data[i] + '\n';
                                            }
                                            console.log(result);
                                            alert(result);
                                        } else {
                                            alert('Request Failed!');
                                            console.log(d);
                                        }
                                    },
                                });
                            }
                        });
                        const help_span = document.createElement('span');
                        help_span.innerHTML = '<br><br><span class="silver">*延时操作较稳定(推荐)</span><br>';
                        for (let old_button of w.querySelectorAll('button[type=button]')) {
                            if (old_button.innerHTML != '确定') {
                                continue;
                            }
                            old_button.parentNode.insertBefore(new_button, old_button);
                            old_button.parentNode.insertBefore(help_span, old_button);
                            old_button.parentNode.insertBefore(new_button2, old_button);
                            old_button.parentNode.removeChild(old_button);
                            break;
                        }
                    });
                    pids_bar.querySelector('tr').appendChild(td_pids_del);
                    // #nga_wd_helper_pids_lessernuke
                    const td_pids_lessernuke = document.createElement('td');
                    td_pids_lessernuke.id = 'nga_wd_helper_pids_lessernuke';
                    td_pids_lessernuke.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量次级NUKE">次级NUKE</a>';
                    td_pids_lessernuke.addEventListener('click', () => {
                        const fid = window.__CURRENT_FID;
                        const tid = window.__CURRENT_TID;
                        window.commonui.lessernuke(null, 1, 1, null);
                        const w = document.querySelector('#commonuiwindow');
                        w._.addTitle('次级NUKE(批量)');
                        const is = w.querySelector('input[maxlength="20"]');
                        const new_is = document.createElement('input');
                        new_is.maxlength = '20';
                        new_is.placeholder = '操作说明(将显示在帖子中)';
                        is.parentNode.insertBefore(new_is, is);
                        is.parentNode.removeChild(is);
                        window.__NUKE.doRequest({
                            u: { u: '/nuke.php?__lib=modify_forum&__act=get_rule&raw=3', a: { tid: 1, pid: 1, fid: window.__CURRENT_FID, ffid: '' } },
                            f: function (d) {
                                const e = window.__NUKE.doRequestIfErr(d);
                                if (e || !d.data[0]) {
                                    return;
                                }
                                const x = d.data[0].replace(/^\s+|\s+$/g, '').replace(/\n/g, '<br>');
                                const is_reason = document.createElement('span');
                                is_reason.innerHTML = '点击展开预设理由...<br>';
                                is_reason.addEventListener('click', () => {
                                    is_reason.innerHTML = `${x}<br>`;
                                });
                                new_is.parentNode.insertBefore(is_reason, new_is.nextElementSibling.nextElementSibling);
                            },
                        });
                        const new_button = document.createElement('button');
                        new_button.type = 'button';
                        new_button.innerHTML = '确定(脚本批量)';
                        new_button.addEventListener('click', () => {
                            const pids = getSelectedPids();
                            if (pids.length == 0) {
                                alert('没有任何有效的选中项目');
                                return;
                            }
                            if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let opt = 2048;
                                for (let child of w.querySelector('div > div.div2 > div > span').childNodes) {
                                    if (child.nodeName != 'INPUT' || !child.checked || !child.nextSibling || !child.nextSibling.nodeValue) {
                                        continue;
                                    }
                                    if (child.nextSibling.nodeValue.startsWith('全论坛')) {
                                        opt |= 128;
                                    } else if (child.nextSibling.nodeValue.startsWith('本版面')) {
                                        opt |= 256;
                                    } else if (child.nextSibling.nodeValue.startsWith('本合集')) {
                                        opt |= 512;
                                    } else if (child.nextSibling.nodeValue.startsWith('本版声望')) {
                                        opt |= 8192;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言2天')) {
                                        opt |= 16;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言4天')) {
                                        opt |= 32;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言6天')) {
                                        opt |= 64;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言30天')) {
                                        opt |= 16384;
                                    } else if (child.nextSibling.nodeValue.startsWith('扣减声望')) {
                                        opt |= 1;
                                    } else if (child.nextSibling.nodeValue.startsWith('加倍扣减声望')) {
                                        opt |= 2;
                                    } else if (child.nextSibling.nodeValue.startsWith('同时扣减威望')) {
                                        opt -= 2048;
                                    } else if (child.nextSibling.nodeValue.startsWith('延时')) {
                                        opt |= 4096;
                                    }
                                }
                                const ist = new_is.value;
                                const il = w.querySelector('textarea[placeholder="更长的操作说明(将通过短信发送)"]').value.replace(/^\s+|\s+$/g, '');
                                if (!ist) {
                                    alert('需要操作说明');
                                    return;
                                }
                                let results = '';
                                const mas = function (pids) {
                                    if (pids.length) {
                                        const pid = pids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'nuke', __act: 'lesser_nuke', tid: tid, pid: pid, opt: opt, info: il, infos: ist, infosk: '', raw: 3, nga_wd_helper_pids_lessernuke: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `pid:${pid} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(pids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(pids);
                            }
                        });
                        for (let old_button of w.querySelectorAll('button[type=button]')) {
                            if (old_button.innerHTML != '确定') {
                                continue;
                            }
                            old_button.parentNode.insertBefore(new_button, old_button);
                            old_button.parentNode.removeChild(old_button);
                            break;
                        }
                    });
                    pids_bar.querySelector('tr').appendChild(td_pids_lessernuke);
                    // 帮助
                    const td_pids_help = document.createElement('td');
                    td_pids_help.innerHTML = '<a href="https://shimo.im/docs/QhJd3dKVvWh9Cx9W" target="_blank" class="cell rep txtbtnx nobr orange" title="查看帮助信息">帮助</a>';
                    pids_bar.querySelector('tr').appendChild(td_pids_help);
                }
                // 赞/踩 机型
                if (window.__GP.admincheck & 2) {
                    const floors = window.commonui.postArg.data;
                    for (let i in floors) {
                        if (!(nga_wd_helper_offs & 1) && floors[i].recommendO && !floors[i].recommendO.innerHTML.includes('/') && floors[i].recommendO.parentNode.style.backgroundColor != 'silver') {
                            floors[i].recommendO.innerHTML = `${floors[i].score} / ${floors[i].score_2}`;
                        }
                        if (!(nga_wd_helper_offs & 2) && floors[i].pInfoC && floors[i].pInfoC.querySelector('a[href*=app]')) {
                            const a_app = floors[i].pInfoC.querySelector('a[href*=app]');
                            const fromClient = (floors[i].fromClient || '').replace(/^\d+ /, '');
                            if (fromClient == '/') {
                                a_app.parentNode.removeChild(a_app);
                            } else {
                                a_app.removeAttribute('style');
                                a_app.style.fontSize = '0.5em';
                                a_app.target = '_blank';
                                a_app.href = `https://cn.bing.com/search?q=${fromClient}`;
                                a_app.innerHTML = fromClient;
                                a_app.parentNode.insertBefore(a_app, a_app.parentNode.firstChild);
                            }
                        }
                    }
                }
                // 标注楼主
                const lzMark = (authorid) => {
                    if ((nga_wd_helper_offs & 8) || !authorid) {
                        return;
                    }
                    if (nga_wd_helper_offs & 32) {
                        const floors = window.commonui.postArg.data;
                        for (let i in floors) {
                            if (floors[i].pAid == authorid && floors[i].recommendO && floors[i].recommendO.parentNode && floors[i].recommendO.parentNode.nextElementSibling && floors[i].recommendO.parentNode.nextElementSibling.name != 'nga_wd_helper_lzmark2') {
                                const mark_span = document.createElement('span');
                                mark_span.name = 'nga_wd_helper_lzmark2';
                                mark_span.innerHTML = ` <a href="/read.php?tid=${window.__CURRENT_TID}&authorid=${authorid}" class="block_txt white nobr vertmod" style="background-color:#369;" title="由楼主发表 点此仅查看楼主发言">楼主</a>`;
                                console.log(floors[i].recommendO.parentNode.parentNode);
                                console.log(floors[i].recommendO.parentNode.nextElementSibling);
                                floors[i].recommendO.parentNode.parentNode.insertBefore(mark_span, floors[i].recommendO.parentNode.nextElementSibling);
                            }
                        }
                    } else {
                        const lzs = document.querySelectorAll(`a[href*="nuke.php?func=ucp&uid=${authorid}"]`);
                        for (let lz of lzs){
                            if (lz.querySelector('span[class=red]')) {
                                continue;
                            }
                            const mark_span = document.createElement('span');
                            mark_span.name = 'mark';
                            mark_span.className = 'red';
                            mark_span.innerHTML = ' [★]';
                            lz.appendChild(mark_span);
                        }
                    }
                };
                lzMark(window.sessionStorage.getItem(`authorid_${window.__CURRENT_TID}`));
                // 主题样式
                if (!(nga_wd_helper_offs & 4) && !document.querySelector('#nga_wd_helper_title')) {
                    const tid = window.__CURRENT_TID;
                    const title_a = document.querySelector('#m_nav a.nav_link[href^=\\/read\\.php]');
                    const recommend_span = document.createElement('span');
                    recommend_span.id = 'nga_wd_helper_title';
                    title_a.appendChild(recommend_span);
                    window.__NUKE.doRequest({
                        u: `https://${nga_wd_helper_jump_target}/read.php?tid=${tid}&pid=0&opt=2&__output=1`,
                        f: function (d) {
                            if (d && !d.error && d.data) {
                                window.sessionStorage.setItem(`authorid_${tid}`, d.data.__T.authorid);
                                lzMark(d.data.__T.authorid);
                                recommend_span.style.fontSize = '0.6em';
                                recommend_span.style.fontWeight = 'normal';
                                recommend_span.innerHTML = ` (${d.data.__T.recommend})`;
                                const topicMiscVar = window.commonui.topicMiscVar;
                                const topic_misc = topicMiscVar.unpack(d.data.__T.topic_misc);
                                title_a.style.padding = '0 10px';
                                title_a.style.color = topic_misc._BIT1 & topicMiscVar._FONT_RED ? '#D00' : topic_misc._BIT1 & topicMiscVar._FONT_BLUE ? '#06B' : topic_misc._BIT1 & topicMiscVar._FONT_GREEN ? '#3D9F0E' : topic_misc._BIT1 & topicMiscVar._FONT_ORANGE ? '#c88100' : topic_misc._BIT1 & topicMiscVar._FONT_SILVER ? '#888' : '#000';
                                title_a.style.fontWeight = topic_misc._BIT1 & topicMiscVar._FONT_B ? 'bold' : 'normal';
                                title_a.style.fontStyle = topic_misc._BIT1 & topicMiscVar._FONT_I ? 'italic' : '';
                                title_a.style.textDecoration = topic_misc._BIT1 & topicMiscVar._FONT_U ? 'line-through' : '';
                            } else {
                                alert('Request Failed!');
                                console.log(d);
                            }
                        },
                    });
                } else if (!(nga_wd_helper_offs & 8) && !document.querySelector('#nga_wd_helper_title')) {
                    const tid = window.__CURRENT_TID;
                    const title_a = document.querySelector('#m_nav a.nav_link[href^=\\/read\\.php]');
                    const recommend_span = document.createElement('span');
                    recommend_span.id = 'nga_wd_helper_title';
                    title_a.appendChild(recommend_span);
                    window.__NUKE.doRequest({
                        u: `https://${nga_wd_helper_jump_target}/read.php?tid=${tid}&pid=0&opt=2&__output=1`,
                        f: function (d) {
                            if (d && !d.error && d.data) {
                                window.sessionStorage.setItem(`authorid_${tid}`, d.data.__T.authorid);
                                lzMark(d.data.__T.authorid);
                            }
                        }
                    });
                }
            }
            if (document.location.href.includes('/thread.php')) {
                //window.commonui.topicArg
                // 批量操作(提前下沉) 批量操作(标题颜色) 批量操作(次级NUKE)
                if (window.__GP.admincheck & 2 && !document.querySelector('#nga_wd_helper_tids_color')) {
                    // #nga_wd_helper_tids_push
                    const td_tids_push = document.createElement('td');
                    td_tids_push.id = 'nga_wd_helper_tids_push';
                    td_tids_push.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量将主题帖提前或下沉">提前下沉</a>';
                    td_tids_push.addEventListener('click', () => {
                        window.adminui.createadminwindow();
                        window.adminui.w._.addContent(null)
                        window.adminui.w._.addTitle('提前或下沉主题(批量)');
                        const push_action = (down = '') =>{
                            const tids_checked = window.commonui.massAdmin.getChecked();
                            if (!tids_checked) {
                                return;
                            }
                            const tids = tids_checked.split(',');
                            if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let results = '';
                                const mas = function (tids) {
                                    if (tids.length) {
                                        const tid = tids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'topic_push', __act: 'push', tid: tid, down: down, raw: 3, nga_wd_helper_tids_push: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `tid:${tid} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(tids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(tids);
                            }
                        }
                        window.adminui.w._.addContent(
                            _$('/button').$0('innerHTML','提前主题','type','button','onclick', () => push_action()),
                            _$('/button').$0('innerHTML','下沉主题','type','button','onclick', () => push_action(1))
                        );
                        window.adminui.w._.show();
                    });
                    document.querySelector('#m_fopts > div > div > table > tbody > tr').appendChild(td_tids_push);
                    // #nga_wd_helper_tids_color
                    const td_tids_color = document.createElement('td');
                    td_tids_color.id = 'nga_wd_helper_tids_color';
                    td_tids_color.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量设置标题颜色">标题颜色</a>';
                    td_tids_color.addEventListener('click', () => {
                        window.adminui.colortopic(null, 1);
                        const w = document.querySelector('#adminwindow');
                        w._.addTitle('改变标题字体(批量)');
                        const new_button = document.createElement('button');
                        new_button.type = 'button';
                        new_button.innerHTML = '确定(脚本批量)';
                        new_button.addEventListener('click', () => {
                            const tids_checked = window.commonui.massAdmin.getChecked();
                            if (!tids_checked) {
                                return;
                            }
                            const tids = tids_checked.split(',');
                            if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let set = '';
                                let opt = 0;
                                const f = w.querySelectorAll('div.div3 > div input');
                                for (let i = 0; i < 8; i++) {
                                    if (f[i].checked) {
                                        set += ',' + f[i].value;
                                    }
                                }
                                for (let i = 9; i < 15; i++) {
                                    if (f[i].checked) {
                                        opt |= f[i].value;
                                    }
                                }
                                let results = '';
                                const mas = function (tids) {
                                    if (tids.length) {
                                        const tid = tids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'topic_color', __act: 'set', tid: tid, font: set, opt: opt, raw: 3, nga_wd_helper_tids_color: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `tid:${tid} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(tids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(tids);
                            }
                        });
                        for (let old_button of w.querySelectorAll('button[type=button]')) {
                            if (old_button.innerHTML != '确定') {
                                continue;
                            }
                            old_button.parentNode.insertBefore(new_button, old_button);
                            old_button.parentNode.removeChild(old_button);
                            break;
                        }
                    });
                    document.querySelector('#m_fopts > div > div > table > tbody > tr').appendChild(td_tids_color);
                    // #nga_wd_helper_tids_lessernuke
                    const td_tids_lessernuke = document.createElement('td');
                    td_tids_lessernuke.id = 'nga_wd_helper_tids_lessernuke';
                    td_tids_lessernuke.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量次级NUKE">次级NUKE</a>';
                    td_tids_lessernuke.addEventListener('click', () => {
                        window.commonui.lessernuke(null, 1, 1, null);
                        const w = document.querySelector('#commonuiwindow');
                        w._.addTitle('次级NUKE(批量)');
                        const is = w.querySelector('input[maxlength="20"]');
                        const new_is = document.createElement('input');
                        new_is.maxlength = '20';
                        new_is.placeholder = '操作说明(将显示在帖子中)';
                        is.parentNode.insertBefore(new_is, is);
                        is.parentNode.removeChild(is);
                        window.__NUKE.doRequest({
                            u: { u: '/nuke.php?__lib=modify_forum&__act=get_rule&raw=3', a: { tid: 1, pid: 1, fid: window.__CURRENT_FID, ffid: '' } },
                            f: function (d) {
                                const e = window.__NUKE.doRequestIfErr(d);
                                if (e || !d.data[0]) {
                                    return;
                                }
                                const x = d.data[0].replace(/^\s+|\s+$/g, '').replace(/\n/g, '<br>');
                                const is_reason = document.createElement('span');
                                is_reason.innerHTML = '点击展开预设理由...<br>';
                                is_reason.addEventListener('click', () => {
                                    is_reason.innerHTML = `${x}<br>`;
                                });
                                new_is.parentNode.insertBefore(is_reason, new_is.nextElementSibling.nextElementSibling);
                            },
                        });
                        const new_button = document.createElement('button');
                        new_button.type = 'button';
                        new_button.innerHTML = '确定(脚本批量)';
                        new_button.addEventListener('click', () => {
                            const tids_checked = window.commonui.massAdmin.getChecked();
                            if (!tids_checked) {
                                return;
                            }
                            const tids = tids_checked.split(',');
                            if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示')) {
                                let opt = 2048;
                                for (let child of w.querySelector('div > div.div2 > div > span').childNodes) {
                                    if (child.nodeName != 'INPUT' || !child.checked || !child.nextSibling || !child.nextSibling.nodeValue) {
                                        continue;
                                    }
                                    if (child.nextSibling.nodeValue.startsWith('全论坛')) {
                                        opt |= 128;
                                    } else if (child.nextSibling.nodeValue.startsWith('本版面')) {
                                        opt |= 256;
                                    } else if (child.nextSibling.nodeValue.startsWith('本合集')) {
                                        opt |= 512;
                                    } else if (child.nextSibling.nodeValue.startsWith('本版声望')) {
                                        opt |= 8192;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言2天')) {
                                        opt |= 16;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言4天')) {
                                        opt |= 32;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言6天')) {
                                        opt |= 64;
                                    } else if (child.nextSibling.nodeValue.startsWith('禁言30天')) {
                                        opt |= 16384;
                                    } else if (child.nextSibling.nodeValue.startsWith('扣减声望')) {
                                        opt |= 1;
                                    } else if (child.nextSibling.nodeValue.startsWith('加倍扣减声望')) {
                                        opt |= 2;
                                    } else if (child.nextSibling.nodeValue.startsWith('同时扣减威望')) {
                                        opt -= 2048;
                                    } else if (child.nextSibling.nodeValue.startsWith('延时')) {
                                        opt |= 4096;
                                    }
                                }
                                const ist = new_is.value;
                                const il = w.querySelector('textarea[placeholder="更长的操作说明(将通过短信发送)"]').value.replace(/^\s+|\s+$/g, '');
                                if (!ist) {
                                    alert('需要操作说明');
                                    return;
                                }
                                let results = '';
                                const mas = function (tids) {
                                    if (tids.length) {
                                        const tid = tids.shift();
                                        window.__NUKE.doRequest({
                                            u: { u: window.__API._base, a: { __lib: 'nuke', __act: 'lesser_nuke', tid: tid, pid: 0, opt: opt, info: il, infos: ist, infosk: '', raw: 3, nga_wd_helper_tids_lessernuke: 1 } },
                                            f: function (d) {
                                                if (d && !d.error && d.data) {
                                                    const result = `tid:${tid} ${d.error ? d.error[0] : d.data[0]}`;
                                                    results += result + '\n';
                                                    console.log(result);
                                                    mas(tids);
                                                } else {
                                                    alert('Request Failed!');
                                                    console.log(d);
                                                }
                                            },
                                        });
                                    } else {
                                        alert(`批量操作完成\n\n${results}`);
                                    }
                                };
                                mas(tids);
                            }
                        });
                        for (let old_button of w.querySelectorAll('button[type=button]')) {
                            if (old_button.innerHTML != '确定') {
                                continue;
                            }
                            old_button.parentNode.insertBefore(new_button, old_button);
                            old_button.parentNode.removeChild(old_button);
                            break;
                        }
                    });
                    document.querySelector('#m_fopts > div > div > table > tbody > tr').appendChild(td_tids_lessernuke);
                    const td_tids_help = document.createElement('td');
                    td_tids_help.innerHTML = '<a href="https://shimo.im/docs/QhJd3dKVvWh9Cx9W" target="_blank" class="cell rep txtbtnx nobr orange" title="查看帮助信息">帮助</a>';
                    document.querySelector('#m_fopts > div > div > table > tbody > tr').appendChild(td_tids_help);
                }
            }
            if (document.location.href.includes('/read.php') || document.location.href.includes('/thread.php')) {
                // 连续翻页
                const np = document.querySelector('a[title=加载下一页]');
                if (!(nga_wd_helper_offs & 16) && np && !document.querySelector('#nga_wd_helper_next5')) {
                    const next5_td = document.createElement('td');
                    next5_td.id = 'nga_wd_helper_next5';
                    next5_td.innerHTML = '<a href="javascript:void(0);" title="连续翻页" class=" uitxt1">&gt;&gt;</a>';
                    next5_td.addEventListener('click', () => {
                        next5_td.style.display = 'none';
                        window.nps = {
                            href: '',
                            timeout: 5,
                            page: 5,
                        };
                        const inv = setInterval(() => {
                            if (window.nps.page-- == 0) {
                                clearInterval(inv);
                                window.commonui.alert('完成：已经向后翻动5页', '翻页结束');
                                return;
                            }
                            if (document.readyState != 'complete') {
                                if (window.nps.timeout-- == 0) {
                                    clearInterval(inv);
                                    window.commonui.alert('中止：翻页超时(>5s)而提前结束', '翻页结束');
                                }
                                return;
                            }
                            const np0 = document.querySelector('a[title=加载下一页]');
                            if (!np0) {
                                clearInterval(inv);
                                window.commonui.alert('中止：已翻到最后一页', '翻页结束');
                                return;
                            }
                            if (np0.href == window.nps.href) {
                                if (window.nps.timeout-- == 0) {
                                    clearInterval(inv);
                                    window.commonui.alert('中止：翻页超时(>5s)而提前结束', '翻页结束');
                                }
                                return;
                            }
                            window.nps.href = np.href;
                            window.nps.timeout = 5;
                            const e0 = document.createEvent('MouseEvents');
                            e0.initEvent('click', true, true);
                            np0.dispatchEvent(e0);
                        }, 1000);
                    });
                    np.parentNode.parentNode.insertBefore(next5_td, np.parentNode.nextElementSibling);
                }
            }
            if (document.location.href.includes('/nuke.php') && document.location.href.includes('func=ucp') && document.querySelector('form[method=post][target=_blank]')) {
                // 用户声望
                const uid = document.querySelector('form[method=post][target=_blank]').action.match(/uid=([0-9]+)/);
                const reputation_span = document.querySelector("#ucpuser_fame_blockContent > div > span");
                if (uid && uid[1] && reputation_span) {
                    reputation_span.innerHTML += '<ul id="nga_wd_helper_reputation" class="info" style="padding: 0px; margin: 0px; min-width: 0px;"></ul>'
                    const nga_wd_helper_reputation_ul = reputation_span.querySelector('#nga_wd_helper_reputation');
                    const regexp = /\[([0-9]+)@([^\[\]]+)]/gm;
                    let reputation_i;
                    while (reputation_i = regexp.exec(nga_wd_helper_reputation)) {
                        const reputation_i_ = reputation_i;
                        window.__NUKE.doRequest({
                            xr: true,
                            u: {
                                u: window.__API._base,
                                a: { func: 'user_reputation', uid: uid[1], nameselect: 'uid', name: reputation_i_[1], __output: '11', nga_wd_helper_reputation: 1 },
                            },
                            f: (d) => {
                                if (d && !d.error && d.data && d.data[0] && d.data[0].includes('声望为')) {
                                    nga_wd_helper_reputation_ul.innerHTML += `<li style="width: 240px;"><label><span title="用户${d.data[0].match(/用户 (.+?) 对用户/)[1]}的声望">${reputation_i_[2]}</span></label><span style="color: gray;"> : ${d.data[0].match(/声望为 (-?[0-9]+)/)[1]}</span></li>`;
                                } else {
                                    alert('Request Failed!');
                                    console.log(d);
                                }
                            },
                        });
                    }
                    //reputation_tabel.innerHTML += reputation_html + '<div class=" clear"><img src="about:blank" style="display: none;"></div>';
                }
            }
        }, 1000);
    }, 100);
})();

