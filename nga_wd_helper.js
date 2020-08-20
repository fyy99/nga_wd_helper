// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.20
// @author            fyy99
// @match             *://ngabbs.com/*
// @match             *://bbs.nga.cn/*
// @match             *://nga.178.com/*
// @run-at            document-end
// @note              v0.10 初始版本：回帖批量锁隐功能完成
// @note              v0.11 更换选中方式 & 插件不会在无管理权限的版面生效
// @note              v0.12 优化选中样式 & 支持帖子属性面板的其他操作
// @note              v0.13 bugfix
// @note              v0.14 批量加分 & 自动修改域名
// @note              v0.15 bugfix & 显示主题样式和加精情况
// @note              v0.16 bugfix & 显示机型和赞/踩
// @note              v0.20 主题批量禁言操作、加精操作 & 新UI(论坛原生面板)
// @grant             none
// ==/UserScript==

(function () {
    'use strict';
    // 跳转
    if (!document.location.href.includes('ngabbs.com')) {
        // ngabbs.com是客户端用的域名，兼容性最好
        document.location.href = document.location.href.replace('bbs.nga.cn', 'ngabbs.com').replace('nga.178.com', 'ngabbs.com');
    }

    // 定时检测刷新
    setInterval(function () {
        if (document.nga_wd_helper_url == document.location.href) {
            return;
        }
        document.nga_wd_helper_url = document.location.href;
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
                // #nga_wd_helper_pids_add
                const td_pids_add = document.createElement('td');
                td_pids_add.id = 'nga_wd_helper_pids_add';
                td_pids_add.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="帖子批量加分">批量操作(加分)</a>';
                td_pids_add.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const pids = getSelectedPids();
                    if (pids.length == 0) {
                        alert('没有任何有效的选中项目');
                        return;
                    }
                    window.adminui.addpoint(null, 1, 1, 1);
                    const w = document.querySelector('#adminwindow');
                    w._.addTitle('评分(批量)');
                    const new_button = document.createElement('button');
                    new_button.type = 'button';
                    new_button.innerHTML = '确定(脚本批量)';
                    new_button.addEventListener('click', () => {
                        if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面')) {
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
                                            const result = `pid:${pid} ${d.error ? d.error[0] : d.data[0]}`;
                                            results += result + '\n';
                                            console.log(result);
                                            mas(pids);
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
                document.querySelector('#postbbtm > table > tbody > tr').appendChild(td_pids_add);
                // #nga_wd_helper_pids_del
                const td_pids_del = document.createElement('td');
                td_pids_del.id = 'nga_wd_helper_pids_del';
                td_pids_del.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr blue" title="批量设置帖子属性">批量操作(属性)</a>';
                td_pids_del.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const ids = getSelectedPids(tid);
                    if (ids.length == 0) {
                        alert('没有任何有效的选中项目');
                        return;
                    }
                    window.commonui.setPost(null, 1, 1, null);
                    const w = document.querySelector('#commonuiwindow');
                    w._.addTitle('设置帖子属性(批量)');
                    const new_button = document.createElement('button');
                    new_button.type = 'button';
                    new_button.innerHTML = '确定(脚本批量)';
                    new_button.addEventListener('click', () => {
                        if (confirm('即将进入批量操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面')) {
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
                                    let result = '批量操作完成\n\n';
                                    for (let i in d.error) {
                                        result += d.error[i] + '\n';
                                    }
                                    for (let i in d.data) {
                                        result += d.data[i] + '\n';
                                    }
                                    console.log(result);
                                    alert(result);
                                },
                            });
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
                document.querySelector('#postbbtm > table > tbody > tr').appendChild(td_pids_del);
            }
            // 主题样式
            if (!document.querySelector('#nga_wd_helper_title')) {
                const tid = window.__CURRENT_TID;
                const title_a = document.querySelector('#m_nav a.nav_link[href^=\\/read\\.php]');
                window.__NUKE.doRequest({
                    u: `https://ngabbs.com/read.php?tid=${tid}&pid=0&opt=2&__output=1`,
                    f: function (d) {
                        if (!d.error && d.data) {
                            console.log(d);
                            const recommend_span = document.createElement('span');
                            recommend_span.id = 'nga_wd_helper_title';
                            recommend_span.style.fontSize = '0.6em';
                            recommend_span.style.fontWeight = 'normal';
                            recommend_span.innerHTML = ` (${d.data.__T.recommend})`;
                            title_a.appendChild(recommend_span);
                            const topicMiscVar = window.commonui.topicMiscVar;
                            const topic_misc = topicMiscVar.unpack(d.data.__T.topic_misc);
                            title_a.style.padding = '0 10px';
                            title_a.style.color = topic_misc._BIT1 & topicMiscVar._FONT_RED ? '#D00' : topic_misc._BIT1 & topicMiscVar._FONT_BLUE ? '#06B' : topic_misc._BIT1 & topicMiscVar._FONT_GREEN ? '#3D9F0E' : topic_misc._BIT1 & topicMiscVar._FONT_ORANGE ? '#c88100' : topic_misc._BIT1 & topicMiscVar._FONT_SILVER ? '#888' : '#000';
                            title_a.style.fontWeight = topic_misc._BIT1 & topicMiscVar._FONT_B ? 'bold' : 'normal';
                            title_a.style.fontStyle = topic_misc._BIT1 & topicMiscVar._FONT_I ? 'italic' : '';
                            title_a.style.textDecoration = topic_misc._BIT1 & topicMiscVar._FONT_U ? 'line-through' : '';
                        }
                    },
                });
            }
            // 机型 赞/踩
            if (window.__GP.admincheck & 2) {
                const floors = window.commonui.postArg.data;
                for (let i in floors) {
                    if (floors[i].recommendO && !floors[i].recommendO.innerHTML.includes('/')) {
                        floors[i].recommendO.innerHTML += ` (<span style="color:#0dc60d;${floors[i].score > 10 ? 'font-weight:bold;' : ''}">${floors[i].score}</span>/<span style="color:#db7c7c;${floors[i].score_2 > 10 ? 'font-weight:bold;' : ''}">${floors[i].score_2}</span>)`;
                    }
                    if (floors[i].pInfoC && floors[i].pInfoC.querySelector('a[href*=app]') && floors[i].pInfoC.querySelector('a[href*=app]').style.fontSize != '0.5em') {
                        floors[i].pInfoC.querySelector('a[href*=app]').removeAttribute('style');
                        floors[i].pInfoC.querySelector('a[href*=app]').style.fontSize = '0.5em';
                        floors[i].pInfoC.querySelector('a[href*=app]').innerHTML = (floors[i].fromClient || '').replace(/^\d+ /, '');
                        floors[i].pInfoC.querySelector('a[href*=app]').parentNode.insertBefore(floors[i].pInfoC.querySelector('a[href*=app]'), floors[i].pInfoC.querySelector('a[href*=app]').parentNode.firstChild);
                    }
                }
            }
        }
        if (document.location.href.includes('/thread.php')) {
            // 批量操作(标题颜色) 批量操作(次级NUKE)
            if (window.__GP.admincheck & 2 && !document.querySelector('#nga_wd_helper_tids_color')) {
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
                        if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面')) {
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
                                            const result = `tid:${tid} ${d.error ? d.error[0] : d.data[0]}`;
                                            results += result + '\n';
                                            console.log(result);
                                            mas(tids);
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
                // #nga_wd_helper_tids_color
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
                            if (e) {
                                return;
                            }
                            const x = d.data[0].replace(/^\s+|\s+$/g, '').split('\n');
                            console.log(x);
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
                        if (confirm('即将进入批量循环操作\n请再次检查参数设置\n批量操作过程中不要关闭窗口或离开本页面')) {
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
                                            const result = `tid:${tid} ${d.error ? d.error[0] : d.data[0]}`;
                                            results += result + '\n';
                                            console.log(result);
                                            mas(tids);
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
            }
        }
    }, 1000);
})();
