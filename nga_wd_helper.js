// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.13
// @author            fyy99
// @match             *://bbs.nga.cn/read.php*
// @match             *://ngabbs.com/read.php*
// @match             *://nga.178.com/read.php*
// @run-at            document-end
// @note              v0.10 初始版本：回帖批量锁隐功能完成
// @note              v0.11 更换选中方式 & 插件不会在无管理权限的版面生效
// @note              v0.12 优化选中样式 & 支持帖子属性面板的其他操作
// @note              v0.13 bugfix
// @grant             none
// ==/UserScript==

(function() {
    'use strict';
    // class/style
    const nga_wd_helper_style = document.createElement('style');
    nga_wd_helper_style.type = 'text/css';
    nga_wd_helper_style.innerHTML = "span[id^=postdate][class*=stxt]{font-weight:bold;cursor:pointer;} span[id^=postdate][class*=stxt][style*=darkred]{color:orangered !important;text-decoration:underline;} span[id^=postdate][class*=stxt][style*=darkred]:before{content:'\\2714  '}";
    document.head.appendChild(nga_wd_helper_style);
    // click
    document.addEventListener('click', (e) => {
        if ((e.target || e.srcElement) && (e.target || e.srcElement).id.startsWith('postdate')) {
            // new button
            if ((window.__GP.admincheck & 2) && !document.querySelector('#nga_wd_helper_pids_del')) {
                const td = document.createElement('td');
                td.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="批量设置帖子属性" id="nga_wd_helper_pids_del">批量操作(属性)</a>';
                td.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const pids = document.querySelectorAll("span[id^=postdate][class*=stxt][style*=darkred]");
                    const ids = [];
                    for (let pid of pids) {
                        if (pid.parentNode && pid.parentNode.parentNode && pid.parentNode.parentNode.firstChild && pid.parentNode.parentNode.firstChild.id.startsWith('pid')){
                            const pid_regexp = new RegExp('pid([0-9]+)Anchor').exec(pid.parentNode.parentNode.firstChild.id);
                            if (pid_regexp && pid_regexp[1]) {
                                ids.push(tid);
                                ids.push(pid_regexp[1]);
                            }
                        }
                    }
                    if (ids.length == 0) {
                        alert('没有任何有效的选中项目');
                        return;
                    }
                    let pon = 0;
                    let poff = 0;
                    switch (prompt("1:锁隐 2:锁定 3:隐藏\n4:解除锁隐 5:编辑许可 6:通过审核\n其他选项视为取消操作", "1")) {
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
                    }
                    if (pon == 0 && poff == 0) {
                        return;
                    }
                    const fd = new FormData();
                    const xr = new XMLHttpRequest();
                    xr.onload = function (e) {
                        const xhr = e.target;
                        if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText.includes('操作成功')) {
                            const data_regexp = new RegExp('"data":{(.*?)},"time":').exec(xhr.responseText);
                            if (data_regexp && data_regexp[1]) {
                                alert(data_regexp[1].replace(/,/g, '\n'));
                            } else {
                                console.error(`【批量操作失败】\nxhr.status: ${xhr.status}\nids: ${ids.join(',')}`);
                                console.error(xhr.responseText);
                                alert('出现了一些问题[#1]，可以在控制台(F12)查看报错');
                            }
                        } else {
                            console.error(`【批量操作失败】\nxhr.status: ${xhr.status}\nids: ${ids.join(',')}`);
                            console.error(xhr.responseText);
                            alert('出现了一些问题[#2]，可以在控制台(F12)查看报错');
                        }
                    }
                    xr.open("POST", `/nuke.php?__lib=topic_lock&__act=set&ids=${ids.join('%2C')}&ton=0&toff=0&pon=${pon}&poff=${poff}&pm=&info=&delay=&cfid=${fid}&raw=3&nga_wd_helper_pids_del=1`);
                    xr.withCredentials = true;
                    xr.send(fd);
                });
                document.querySelector("#postbbtm > table > tbody > tr").appendChild(td);
            }
        }
    });
})();
