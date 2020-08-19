// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.16
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
// @grant             none
// ==/UserScript==

(function() {
    'use strict';
    // 跳转
    if (!document.location.href.includes('ngabbs.com')) {
        // ngabbs.com是客户端用的域名，兼容性最好
        document.location.href = document.location.href.replace('bbs.nga.cn', 'ngabbs.com').replace('nga.178.com','ngabbs.com');
    }

    // 定时检测刷新
    // [TODO:显示机型，显示赞/踩]
    setInterval(function () {
        if (document.nga_wd_helper_url == document.location.href) {
            return;
        }
        document.nga_wd_helper_url = document.location.href;
        if (document.location.href.includes('/read.php')) {
            // 批量操作(加分)按钮 批量操作(属性)按钮
            if ((window.__GP.admincheck & 2) && !document.querySelector('#nga_wd_helper_pids_add')) {
                // class/style
                const nga_wd_helper_style = document.createElement('style');
                nga_wd_helper_style.type = 'text/css';
                nga_wd_helper_style.innerHTML = "span[id^=postdate][class*=stxt]{font-weight:bold;cursor:pointer;} span[id^=postdate][class*=stxt][style*=darkred]{color:orangered !important;text-decoration:underline;} span[id^=postdate][class*=stxt][style*=darkred]:before{content:'\\2714  '}";
                document.head.appendChild(nga_wd_helper_style);
                // select
                const getSelectedPids = (tid = false) => {
                    const pids = document.querySelectorAll("span[id^=postdate][class*=stxt][style*=darkred]");
                    const ids = [];
                    for (let pid of pids) {
                        if (pid.parentNode && pid.parentNode.parentNode && pid.parentNode.parentNode.firstChild && pid.parentNode.parentNode.firstChild.id.startsWith('pid')){
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
                td_pids_add.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="帖子批量加分">批量操作(加分)</a>';
                td_pids_add.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const pids = getSelectedPids();
                    if (pids.length == 0) {
                        alert('没有任何有效的选中项目');
                        return;
                    }
                    let opt;
                    switch (prompt("1:声望威望金钱  2:声望威望  3:声望金钱\n4:声望(不限制档位)\n其他选项视为取消操作\n该操作将发送PM、加精、加推荐值", "1")) {
                        case '1':
                            opt = 0 | 8 | 16777216 | 8388608 | 4 | 2 | 1;
                            break;
                        case '2':
                            opt = 0 | 8 | 16777216 | 8388608 | 4 | 2;
                            break;
                        case '3':
                            opt = 0 | 8 | 16777216 | 8388608 | 4 | 1;
                            break;
                        case '4':
                            opt = 4194304 | 8 | 16777216 | 8388608 | 4;
                            break;
                        default:
                            alert('您已取消操作');
                            return;
                    }
                    let value = '';
                    if (opt & 4194304) {
                        value = prompt("声望范围：-1500~1500\n输入并确认后继续\n\n操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示", "15");
                        if (!value) {
                            alert('您已取消操作');
                            return;
                        }
                    } else {
                        switch (prompt("加分档位：\n15/30/45/60/75/105/150/225/300/375/450/525/600\n输入并确认后继续\n\n加分过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示", "15")) {
                            case '15':
                                opt |= 16;
                                break;
                            case '30':
                                opt |= 32;
                                break;
                            case '45':
                                opt |= 64;
                                break;
                            case '60':
                                opt |= 128;
                                break;
                            case '75':
                                opt |= 256;
                                break;
                            case '105':
                                opt |= 512;
                                break;
                            case '150':
                                opt |= 1024;
                                break;
                            case '225':
                                opt |= 2048;
                                break;
                            case '300':
                                opt |= 4096;
                                break;
                            case '375':
                                opt |= 8192;
                                break;
                            case '450':
                                opt |= 16384;
                                break;
                            case '525':
                                opt |= 32768;
                                break;
                            case '600':
                                opt |= 65536;
                                break;
                            default:
                                alert('您已取消操作');
                                return;
                        }
                    }
                    let results = '';
                    const mas = function (pids) {
                        if (pids.length) {
                            const pid = pids.shift();
                            window.__NUKE.doRequest({
                                u: {u: window.__API._base,
                                    a: {__lib:"add_point_v3",__act:"add",opt:opt,fid:fid,tid:tid,pid:pid,info:'',value:value,raw:3,nga_wd_helper_pids_add:1}},
                                f: function(d) {
                                    const result = `pid:${pid} ${d.error ? d.error[0] : d.data[0]}`;
                                    results += result + '\n';
                                    console.log(result);
                                    mas(pids);
                                }
                            });
                        } else {
                            alert(`批量操作完成\n\n${results}`);
                        }
                    }
                    mas(pids);
                });
                document.querySelector("#postbbtm > table > tbody > tr").appendChild(td_pids_add);
                // #nga_wd_helper_pids_del
                const td_pids_del = document.createElement('td');
                td_pids_del.id = 'nga_wd_helper_pids_del';
                td_pids_del.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="批量设置帖子属性">批量操作(属性)</a>';
                td_pids_del.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const ids = getSelectedPids(tid);
                    if (ids.length == 0) {
                        alert('没有任何有效的选中项目');
                        return;
                    }
                    let pon = 0;
                    let poff = 0;
                    switch (prompt("1:锁隐  2:锁定  3:隐藏\n4:解除锁隐  5:编辑许可  6:通过审核\n其他选项视为取消操作\n该操作不会发送PM\n\n操作过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示", "1")) {
                        case '1':
                            pon = 1026;
                            break;
                        case '2':
                            pon = 1024;
                            break;
                        case '3':
                            pon = 2;
                            break;
                        case '4':
                            poff = 1026;
                            break;
                        case '5':
                            pon = 128;
                            break;
                        case '6':
                            poff = 67109376;
                            break;
                        default:
                            alert('您已取消操作');
                            return;
                    }
                    window.__NUKE.doRequest({
                        u: {u: window.__API._base,
                            a: {__lib:"topic_lock",__act:"set",ids:ids.join(','),ton:0,toff:0,pon:pon,poff:poff,pm:'',info:'',delay:'',cfid:fid,raw:3,nga_wd_helper_pids_del:1}},
                        f: function(d) {
                            let result = '批量操作完成\n\n';
                            for (let i in d.error) {
                                result += d.error[i] + '\n';
                            }
                            for (let i in d.data) {
                                result += d.data[i] + '\n';
                            }
                            console.log(result);
                            alert(result);
                        }
                    });
                });
                document.querySelector("#postbbtm > table > tbody > tr").appendChild(td_pids_del);
            }
            // 主题样式
            if (!document.querySelector('#nga_wd_helper_title')) {
                const tid = window.__CURRENT_TID;
                const title_a = document.querySelector("#m_nav a.nav_link[href^=\\/read\\.php]");
                window.__NUKE.doRequest({
                    u: `https://ngabbs.com/read.php?tid=${tid}&pid=0&opt=2&__output=1`,
                    f: function (d) {
                        if (!d.error && d.data) {
                            console.log(d);
                            const recommend_span = document.createElement('span');
                            recommend_span.id = 'nga_wd_helper_title';
                            recommend_span.style.fontSize = '0.7em';
                            recommend_span.style.fontWeight = 'normal';
                            recommend_span.innerHTML = ` (${d.data.__T.recommend})`;
                            title_a.appendChild(recommend_span);
                            const topicMiscVar = window.commonui.topicMiscVar;
                            const topic_misc = topicMiscVar.unpack(d.data.__T.topic_misc);
                            title_a.style.padding = '0 10px';
                            title_a.style.color = (topic_misc._BIT1 & topicMiscVar._FONT_RED) ? '#D00' : (topic_misc._BIT1 & topicMiscVar._FONT_BLUE) ? '#06B' : (topic_misc._BIT1 & topicMiscVar._FONT_GREEN) ? '#3D9F0E' : (topic_misc._BIT1 & topicMiscVar._FONT_ORANGE) ? '#c88100' : (topic_misc._BIT1 & topicMiscVar._FONT_SILVER) ? '#888' : '#000';
                            title_a.style.fontWeight = (topic_misc._BIT1 & topicMiscVar._FONT_B) ? 'bold' : 'normal';
                            title_a.style.fontStyle = (topic_misc._BIT1 & topicMiscVar._FONT_I) ? 'italic' : '';
                            title_a.style.textDecoration = (topic_misc._BIT1 & topicMiscVar._FONT_U) ? 'line-through' : '';
                        }
                    }
                });
            }
            // 机型 赞/踩
            if (window.__GP.admincheck & 2) {
            const floors = window.commonui.postArg.data;
                for (let i in floors) {
                    if (floors[i].recommendO && !floors[i].recommendO.innerHTML.includes('/')) {
                        floors[i].recommendO.innerHTML += ` (<span style="color:#0dc60d;">${floors[i].score}</span>/<span style="color:#db7c7c;">${floors[i].score_2}</span>)`
                    }
                    if (floors[i].pInfoC && floors[i].pInfoC.querySelector("a[href*=app]") && !floors[i].pInfoC.querySelector("a[href*=app]").innerHTML.includes('/')) {
                        floors[i].pInfoC.querySelector("a[href*=app]").removeAttribute('style');
                        floors[i].pInfoC.querySelector("a[href*=app]").style.fontSize = '0.5em';
                        floors[i].pInfoC.querySelector("a[href*=app]").innerHTML = (floors[i].fromClient || '').replace(/^\d+ /, '');
                    }
                }
            }
        }
    }, 1000);
})();
